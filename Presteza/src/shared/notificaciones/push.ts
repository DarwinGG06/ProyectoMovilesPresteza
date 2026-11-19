import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/** Lo que trae un push de Presteza en `data` (lo arma el backend). */
export type PayloadPush = {
  id?: string;
  href?: string;
  title?: string;
  body?: string;
};

function projectIdExpo() {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ||
    (Constants as { easConfig?: { projectId?: string } }).easConfig?.projectId ||
    null
  );
}

/**
 * Solo rutas internas de la app (`/seguimiento?id=...`). Si un push trae una
 * URL externa o algo raro, no se navega.
 */
function rutaInterna(valor: unknown): string | undefined {
  if (typeof valor !== 'string') return undefined;
  const ruta = valor.trim();
  if (!ruta.startsWith('/') || ruta.startsWith('//')) return undefined;
  return ruta;
}

function leerPayload(contenido: Notifications.NotificationContent): PayloadPush {
  const data = (contenido.data || {}) as Record<string, unknown>;
  return {
    id: typeof data.id === 'string' ? data.id : undefined,
    href: rutaInterna(data.href),
    title: contenido.title || undefined,
    body: contenido.body || undefined,
  };
}

/** Token Expo Push para APK/dispositivo. En web o sin permiso devuelve null. */
export async function obtenerExpoPushToken(): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('presteza', {
        name: 'Presteza',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 120, 250],
        lightColor: '#6b1d3d',
        sound: 'default',
      });
    }

    const actual = await Notifications.getPermissionsAsync();
    let estado = actual.status;
    if (estado !== 'granted') {
      const pedido = await Notifications.requestPermissionsAsync();
      estado = pedido.status;
    }
    if (estado !== 'granted') return null;

    // Emulador Android a veces sirve; iOS necesita dispositivo real.
    if (Platform.OS === 'ios' && !Device.isDevice) return null;

    const projectId = projectIdExpo();
    if (!projectId) return null;

    // En Expo Go (Android) esto falla: el push remoto necesita un APK/dev build.
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    return token.data || null;
  } catch {
    return null;
  }
}

export function escucharPushRecibido(onRecibido: (payload: PayloadPush) => void) {
  return Notifications.addNotificationReceivedListener((aviso) => {
    onRecibido(leerPayload(aviso.request.content));
  });
}

/**
 * Toques ya atendidos (por identificador del push). Evita abrir dos veces la
 * misma pantalla: el listener y `leerToqueInicial` pueden ver el mismo toque.
 */
const toquesAtendidos = new Set<string>();

function atender(respuesta: Notifications.NotificationResponse): PayloadPush | null {
  const clave = respuesta.notification.request.identifier;
  if (toquesAtendidos.has(clave)) return null;
  toquesAtendidos.add(clave);
  return leerPayload(respuesta.notification.request.content);
}

/** Toque en un push con la app abierta o en segundo plano. */
export function escucharToquePush(onToque: (payload: PayloadPush) => void) {
  return Notifications.addNotificationResponseReceivedListener((respuesta) => {
    const payload = atender(respuesta);
    if (payload) onToque(payload);
  });
}

/**
 * Toque que ABRIÓ la app estando cerrada (arranque en frío).
 *
 * En ese caso el listener de arriba se registra tarde (la sesión tarda en
 * restaurarse) y no se entera del toque. Por eso, al montar, se pregunta cuál
 * fue la última respuesta y se atiende si no se había atendido.
 */
export async function leerToqueInicial(): Promise<PayloadPush | null> {
  if (Platform.OS === 'web') return null;
  try {
    const respuesta = await Notifications.getLastNotificationResponseAsync();
    if (!respuesta) return null;
    const payload = atender(respuesta);
    // Se limpia para que no se repita al volver a montar el provider (p. ej. tras un logout/login).
    await Notifications.clearLastNotificationResponseAsync();
    return payload;
  } catch {
    return null;
  }
}
