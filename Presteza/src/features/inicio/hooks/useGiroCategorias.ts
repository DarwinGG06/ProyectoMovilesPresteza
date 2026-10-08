import { useEffect } from 'react';
import { Easing, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

const DURACION_VUELTA = 48000;

/** Ángulo compartido que hace girar la órbita de categorías. */
export function useGiroCategorias() {
  const giro = useSharedValue(0);

  useEffect(() => {
    giro.value = withRepeat(
      withTiming(360, { duration: DURACION_VUELTA, easing: Easing.linear }),
      -1,
      false,
    );
  }, [giro]);

  return giro;
}
