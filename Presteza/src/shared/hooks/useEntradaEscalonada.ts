import { useEffect, useRef } from 'react';
import { Animated, Platform } from 'react-native';

const usarNativo = Platform.OS !== 'web';

type Opciones = {
  visible: boolean;
  /** Milisegundos de espera, para que los ítems entren uno detrás de otro. */
  delay: number;
  duracion?: number;
  desplazamiento?: number;
};

/**
 * Entrada en cascada de los ítems de un menú lateral: aparecen desplazándose
 * desde la derecha y vuelven al punto de partida cuando el menú se cierra.
 */
export function useEntradaEscalonada({
  visible,
  delay,
  duracion = 400,
  desplazamiento = 20,
}: Opciones) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(desplazamiento)).current;

  useEffect(() => {
    if (!visible) {
      opacity.setValue(0);
      translateX.setValue(desplazamiento);
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: duracion, delay, useNativeDriver: usarNativo }),
      Animated.timing(translateX, { toValue: 0, duration: duracion, delay, useNativeDriver: usarNativo }),
    ]).start();
  }, [delay, desplazamiento, duracion, opacity, translateX, visible]);

  return { opacity, transform: [{ translateX }] };
}
