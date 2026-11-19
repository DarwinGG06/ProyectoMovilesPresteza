import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

import { getNotifications } from './cargarNotificaciones';

export type PayloadPush = {
  id?: string;
  href?: string;
  title?: string;
  body?: string;
};

export type EstadoPermisoAvisos = 'granted' | 'denied' | 'undetermined' | 'unavailable';

type Sub = { remove: () => void };

function projectIdExpo() {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ||
    (Constants as { easConfig?: { projectId?: string } }).easConfig?.projectId ||
    null
  );
}

function rutaInterna(valor: unknown): string | undefined {
  if (typeof valor !== 'string') return undefined;
  const ruta = valor.trim();
  if (!ruta.startsWith('/') || ruta.startsWith('//')) return undefined;
  return ruta;
}

function leerPayload(contenido: {
  title?: string | null;
  body?: string | null;
  data?: Record<string, unknown> | null;
}): PayloadPush {
  const data = (contenido.data || {}) as Record<string, unknown>;
  return {
    id: typeof data.id === 'string' ? data.id : undefined,
    href: rutaInterna(data.href),
    title: contenido.title || undefined,
    body: contenido.body || undefined,
  };
}

async function canalAndroid() {
  const Notifications = getNotifications();
  if (!Notifications || Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('presteza', {
    name: 'Presteza',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 120, 250],
    lightColor: '#6b1d3d',
    sound: 'default',
  });
}

/** Estado del permiso nativo. En Expo Go / web: unavailable. */
export async function estadoPermisoAvisos(): Promise<EstadoPermisoAvisos> {
  const Notifications = getNotifications();
  if (!Notifications) return 'unavailable';
  try {
    const actual = await Notifications.getPermissionsAsync();
    if (actual.granted || actual.status === 'granted') return 'granted';
    if (actual.status === 'denied') return 'denied';
    return 'undetermined';
  } catch {
    return 'unavailable';
  }
}

/** Pide el permiso del sistema (APK / dev build). */
export async function pedirPermisoAvisos(): Promise<boolean> {
  const Notifications = getNotifications();
  if (!Notifications) return false;
  try {
    await canalAndroid();
    const actual = await Notifications.getPermissionsAsync();
    if (actual.granted || actual.status === 'granted') return true;
    const pedido = await Notifications.requestPermissionsAsync();
    return pedido.granted || pedido.status === 'granted';
  } catch {
    return false;
  }
}

/** Token Expo Push. No vuelve a pedir permiso: asume que ya se concedió. */
export async function obtenerExpoPushToken(): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  const Notifications = getNotifications();
  if (!Notifications) return null;

  try {
    await canalAndroid();
    const actual = await Notifications.getPermissionsAsync();
    if (!(actual.granted || actual.status === 'granted')) return null;
    if (Platform.OS === 'ios' && !Device.isDevice) return null;
    const projectId = projectIdExpo();
    if (!projectId) return null;
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    return token.data || null;
  } catch {
    return null;
  }
}

export function escucharPushRecibido(onRecibido: (payload: PayloadPush) => void): Sub {
  const Notifications = getNotifications();
  if (!Notifications) return { remove: () => {} };
  return Notifications.addNotificationReceivedListener((aviso) => {
    onRecibido(leerPayload(aviso.request.content));
  });
}

export function escucharToquePush(onToque: (payload: PayloadPush) => void): Sub {
  const Notifications = getNotifications();
  if (!Notifications) return { remove: () => {} };
  return Notifications.addNotificationResponseReceivedListener((respuesta) => {
    onToque(leerPayload(respuesta.notification.request.content));
  });
}
