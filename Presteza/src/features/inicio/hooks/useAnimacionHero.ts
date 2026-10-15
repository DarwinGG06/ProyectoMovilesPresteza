import { useEffect } from 'react';
import { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

/** El plato principal flota y el halo late, los dos en bucle. */
export function useAnimacionHero() {
  const flota = useSharedValue(0);
  const brillo = useSharedValue(0.35);

  useEffect(() => {
    flota.value = withRepeat(
      withTiming(-10, { duration: 3400, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    brillo.value = withRepeat(
      withTiming(0.7, { duration: 2600, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [brillo, flota]);

  const platoGrande = useAnimatedStyle(() => ({
    transform: [{ translateY: flota.value }],
  }));

  const halo = useAnimatedStyle(() => ({
    borderColor: `rgba(212,175,119,${brillo.value})`,
  }));

  return { platoGrande, halo };
}
