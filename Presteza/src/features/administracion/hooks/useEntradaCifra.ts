import { useEffect } from 'react';
import { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

/** Aparición de la cifra de ingresos al entrar al panel de administración. */
export function useEntradaCifra() {
  const entrada = useSharedValue(0);

  useEffect(() => {
    entrada.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
  }, [entrada]);

  return useAnimatedStyle(() => ({
    opacity: entrada.value,
    transform: [{ translateY: (1 - entrada.value) * 14 }],
  }));
}
