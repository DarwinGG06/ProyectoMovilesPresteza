import { useEffect } from 'react';
import { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

export function useEntradaHeroContacto() {
  const opacidad = useSharedValue(0);
  const desplazamiento = useSharedValue(28);

  useEffect(() => {
    opacidad.value = withTiming(1, { duration: 720 });
    desplazamiento.value = withTiming(0, {
      duration: 720,
      easing: Easing.out(Easing.cubic),
    });
  }, [desplazamiento, opacidad]);

  return useAnimatedStyle(() => ({
    opacity: opacidad.value,
    transform: [{ translateY: desplazamiento.value }],
  }));
}
