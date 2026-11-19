import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { isRunningInExpoGo } from 'expo';

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
    if (Platform.OS === 'android' && !isRunningInExpoGo()) {
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
    // Los permisos anteriores también sirven para notificaciones locales.
    // Expo Go en Android no permite obtener el token push remoto.
    if (Platform.OS === 'android' && isRunningInExpoGo()) return null;

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
 * Toque en un push. Solo entrega los datos (para marcar el aviso como leído);
 * la navegación al `href` la hace `useNavegacionAvisos`.
 */
export function escucharToquePush(onToque: (payload: PayloadPush) => void) {
  return Notifications.addNotificationResponseReceivedListener((respuesta) => {
    onToque(leerPayload(respuesta.notification.request.content));
  });
}
