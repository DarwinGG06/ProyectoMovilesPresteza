import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { planCumpleanios, type PerfilCumpleanios } from './fechasCumpleanios';
import { isRunningInExpoGo } from 'expo';

const CANAL = 'presteza';

type DatosAvisoCumpleanios = {
  usuarioId: string;
  periodo: string;
  fechaAviso: Date;
  fin?: number;
};

function identificarAviso(usuarioId: string, periodo: string) {
  return `cumpleanios-${usuarioId}-${periodo}`;
}

export async function programarAvisoCumpleanios({
  usuarioId,
  periodo,
  fechaAviso,
  fin,
}: DatosAvisoCumpleanios): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  if (!usuarioId || !periodo) {
    throw new Error('Falta identificar el usuario o el periodo de cumpleaños.');
  }

  const instante = fechaAviso.getTime();

  if (!Number.isFinite(instante) || instante <= Date.now()) {
    throw new Error('La fecha del aviso debe ser válida y estar en el futuro.');
  }

  if (Platform.OS === 'android' && !isRunningInExpoGo()) {
    await Notifications.setNotificationChannelAsync(CANAL, {
      name: 'Presteza',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 120, 250],
      lightColor: '#6b1d3d',
      sound: 'default',
    });
  }

  // El permiso se solicita desde el flujo compartido.
  const permiso = await Notifications.getPermissionsAsync();

  if (!permiso.granted) return null;

  const identificador = identificarAviso(usuarioId, periodo);

  // Reemplaza un aviso pendiente del mismo periodo.
  await Notifications.cancelScheduledNotificationAsync(identificador);

  return Notifications.scheduleNotificationAsync({
    identifier: identificador,
    content: {
      title: '¡Celebra tu cumpleaños en Presteza!',
      body:
        'Tu beneficio de cumpleaños está disponible: ' +
        '15 % de descuento, una vez al año y sin combinar con puntos.',
      sound: 'default',
      data: {
        tipo: 'cumpleanios',
        usuarioId,
        periodo,
        fin,
        href: '/perfil?pestana=puntos',
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: fechaAviso,
      ...(Platform.OS === 'android' && !isRunningInExpoGo() ? { channelId: CANAL } : {}),
    },
  });
}

type Registro = { usuarioId: string; fecha: number; fin: number };
const CLAVE_REGISTROS = 'presteza.cumpleanios.registros';
let cuentaActual: string | null = null;
let cola: Promise<unknown> = Promise.resolve();

function enCola<T>(operacion: () => Promise<T>): Promise<T> {
  const siguiente = cola.then(operacion);
  cola = siguiente.catch(() => undefined);
  return siguiente;
}

async function leerRegistros(): Promise<Record<string, Registro>> {
  const texto = await SecureStore.getItemAsync(CLAVE_REGISTROS);
  return texto ? JSON.parse(texto) : {};
}

/** Cancela únicamente los avisos locales de cumpleaños, nunca pedidos/reservas. */
async function limpiarAvisos(conservar: (id: string, usuarioId: unknown, fin: unknown) => boolean) {
  const pendientes = await Notifications.getAllScheduledNotificationsAsync();
  const visibles = await Notifications.getPresentedNotificationsAsync();
  for (const aviso of pendientes) {
    const datos = aviso.content.data;
    if (datos?.tipo === 'cumpleanios' && !conservar(aviso.identifier, datos.usuarioId, datos.fin)) {
      await Notifications.cancelScheduledNotificationAsync(aviso.identifier);
    }
  }
  for (const aviso of visibles) {
    const datos = aviso.request.content.data;
    if (
      datos?.tipo === 'cumpleanios' &&
      !conservar(aviso.request.identifier, datos.usuarioId, datos.fin)
    ) {
      await Notifications.dismissNotificationAsync(aviso.request.identifier);
    }
  }
}

/** Se llama en login/logout reales; bloquear con huella no cierra esta cuenta. */
export function establecerCuentaCumpleanios(usuarioId: string | null) {
  cuentaActual = usuarioId;
  if (Platform.OS === 'web') return;
  void enCola(async () => {
    const registros = await leerRegistros();
    await limpiarAvisos(
      (_id, titular, fin) => titular === cuentaActual && typeof fin === 'number' && fin > Date.now()
    );
    for (const [id, registro] of Object.entries(registros)) {
      // Permite reprogramar un aviso futuro cancelado al salir; conserva el
      // historial de los ya vencidos para no repetirlos en el próximo login.
      if (registro.usuarioId !== cuentaActual && registro.fecha > Date.now()) delete registros[id];
    }
    await SecureStore.setItemAsync(CLAVE_REGISTROS, JSON.stringify(registros));
  }).catch((error) => console.warn('No se pudieron limpiar los avisos de cumpleaños', error));
}

export function sincronizarAvisoCumpleanios(perfil: PerfilCumpleanios) {
  if (Platform.OS === 'web') return Promise.resolve();
  return enCola(async () => {
    if (cuentaActual !== perfil.id) return;
    const plan = planCumpleanios(perfil);
    const id = plan ? identificarAviso(perfil.id, plan.periodo) : null;
    const registros = await leerRegistros();
    await limpiarAvisos((avisoId) => avisoId === id);
    if (!plan || !id || cuentaActual !== perfil.id) return;

    const permiso = await Notifications.getPermissionsAsync();
    if (!permiso.granted) return;
    const pendientes = await Notifications.getAllScheduledNotificationsAsync();
    // Conserva el historial para no repetir avisos al volver a abrir la app.
    if (registros[id]?.fecha <= Date.now() || pendientes.some((aviso) => aviso.identifier === id)) return;
    if (cuentaActual !== perfil.id) return;
    const creado = await programarAvisoCumpleanios({ usuarioId: perfil.id, ...plan });
    if (!creado) return;
    registros[id] = { usuarioId: perfil.id, fecha: plan.fechaAviso.getTime(), fin: plan.fin };
    try {
      await SecureStore.setItemAsync(CLAVE_REGISTROS, JSON.stringify(registros));
    } catch (error) {
      await cancelarAvisoCumpleanios(perfil.id, plan.periodo);
      throw error;
    }
  });
}

const observadores = new Set<() => void>();
export function avisarCambioCumpleanios() {
  observadores.forEach((escuchar) => escuchar());
}
export function escucharCambioCumpleanios(escuchar: () => void) {
  observadores.add(escuchar);
  return () => {
    observadores.delete(escuchar);
  };
}

export async function cancelarAvisoCumpleanios(usuarioId: string, periodo: string): Promise<void> {
  if (Platform.OS === 'web') return;

  const identificador = identificarAviso(usuarioId, periodo);

  // Cancela el aviso pendiente.
  await Notifications.cancelScheduledNotificationAsync(identificador);

  // Retira el aviso si ya estaba visible.
  await Notifications.dismissNotificationAsync(identificador);
}
