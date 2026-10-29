import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { AppState } from 'react-native';

/** Actualiza listas visibles sin borrar datos ni mostrar un cargador en cada consulta. */
export function usePedidosActualizados<T>(
  consultar: () => Promise<T[]>,
  recibir: (items: T[]) => void,
  habilitado = true
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
      const timer = setInterval(() => void actualizar(), 5000);
      const subscription = AppState.addEventListener('change', (state) => {
        if (state === 'active') void actualizar();
      });
      return () => {
        vigente = false;
        clearInterval(timer);
        subscription.remove();
      };
    }, [consultar, recibir, habilitado])
  );
}
