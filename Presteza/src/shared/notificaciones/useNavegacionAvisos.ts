import * as Notifications from 'expo-notifications';
import { router, useRootNavigationState, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { useSession } from '@/session/context';

const consumidas = new Set<string>();

export function useNavegacionAvisos() {
  const { user, isAuthenticated } = useSession();
  const navegacion = useRootNavigationState();
  const [respuesta, setRespuesta] = useState<Notifications.NotificationResponse | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    const escucha = Notifications.addNotificationResponseReceivedListener(setRespuesta);
    setRespuesta(Notifications.getLastNotificationResponse());
    return () => escucha.remove();
  }, []);

  useEffect(() => {
    if (!respuesta || !isAuthenticated || !user || !navegacion?.key) return;
    const aviso = respuesta.notification;
    const clave = `${aviso.request.identifier}-${aviso.date}`;
    const datos = aviso.request.content.data;
    const href = datos?.href;
    const propia = datos?.tipo !== 'cumpleanios' || datos.usuarioId === user.id;
    const valida = typeof href === 'string' && href.startsWith('/') && !href.startsWith('//');
    if (propia && valida && !consumidas.has(clave)) {
      consumidas.add(clave);
      router.push(href as Href);
    }
    const ultima = Notifications.getLastNotificationResponse();
    if (
      ultima?.notification.request.identifier === aviso.request.identifier &&
      ultima.notification.date === aviso.date
    )
      Notifications.clearLastNotificationResponse();
    setRespuesta(null);
  }, [respuesta, isAuthenticated, user, navegacion?.key]);
}
