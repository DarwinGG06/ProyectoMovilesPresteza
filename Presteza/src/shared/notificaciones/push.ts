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

function projectIdExpo() {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ||
    (Constants as { easConfig?: { projectId?: string } }).easConfig?.projectId ||
    null
  );
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

    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    return token.data || null;
  } catch {
    return null;
  }
}

export function escucharPushRecibido(
  onRecibido: (payload: { id?: string; href?: string; title?: string; body?: string }) => void,
) {
  return Notifications.addNotificationReceivedListener((aviso) => {
    const data = (aviso.request.content.data || {}) as Record<string, unknown>;
    onRecibido({
      id: typeof data.id === 'string' ? data.id : undefined,
      href: typeof data.href === 'string' ? data.href : undefined,
      title: aviso.request.content.title || undefined,
      body: aviso.request.content.body || undefined,
    });
  });
}

export function escucharToquePush(onToque: (href?: string) => void) {
  return Notifications.addNotificationResponseReceivedListener((respuesta) => {
    const data = (respuesta.notification.request.content.data || {}) as Record<string, unknown>;
    onToque(typeof data.href === 'string' ? data.href : undefined);
  });
}
