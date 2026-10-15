import { useEffect } from 'react';
import { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

/** Aparición del encabezado del perfil al entrar a la pantalla. */
export function useEntradaHero() {
  const entrada = useSharedValue(0);

  useEffect(() => {
    entrada.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });
  }, [entrada]);

  return useAnimatedStyle(() => ({
    opacity: entrada.value,
    transform: [{ translateY: (1 - entrada.value) * 10 }],
  }));
}
