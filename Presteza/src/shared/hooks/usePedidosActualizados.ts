import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { AppState, DeviceEventEmitter } from 'react-native';

import { EVENTO_AVISO, EVENTO_PEDIDO, EVENTO_RESERVA } from '@/shared/realtime/eventos';

const EVENTOS_DEFAULT = [EVENTO_PEDIDO, EVENTO_RESERVA, EVENTO_AVISO];

/** Refresco en vivo: WebSocket (inmediato) + poll de respaldo mientras la pantalla está enfocada. */
export function usePedidosActualizados<T>(
  consultar: () => Promise<T[]>,
  recibir: (items: T[]) => void,
  habilitado = true,
  /** Respaldo si cae el socket; por defecto 3 s. */
  intervaloMs = 3000,
  /** Eventos de DeviceEventEmitter que disparan refresco inmediato. */
  eventos: string[] = EVENTOS_DEFAULT,
) {
  useFocusEffect(
    useCallback(() => {
      if (!habilitado) return;
      let vigente = true;
      let consultando = false;
      const actualizar = async () => {
        if (!vigente || consultando || AppState.currentState !== 'active') return;
        consultando = true;
        try {
          const items = await consultar();
          if (vigente) recibir(items);
        } catch {
          // Una caída temporal conserva la última lista y se reintenta en la siguiente consulta.
        } finally {
          consultando = false;
        }
      };
      void actualizar();
      const timer = setInterval(() => void actualizar(), Math.max(2000, intervaloMs));
      const subscription = AppState.addEventListener('change', (state) => {
        if (state === 'active') void actualizar();
      });
      const listeners = eventos.map((nombre) =>
        DeviceEventEmitter.addListener(nombre, () => void actualizar()),
      );
      return () => {
        vigente = false;
        clearInterval(timer);
        subscription.remove();
        listeners.forEach((sub) => sub.remove());
      };
    }, [consultar, recibir, habilitado, intervaloMs, eventos]),
  );
}
