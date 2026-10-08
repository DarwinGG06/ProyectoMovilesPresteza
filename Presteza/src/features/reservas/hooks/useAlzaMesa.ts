import { useEffect } from 'react';
import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

/** La mesa se levanta y crece un poco cuando queda seleccionada. */
export function useAlzaMesa(seleccionada: boolean) {
  const alza = useSharedValue(0);

  useEffect(() => {
    alza.value = withSpring(seleccionada ? 1 : 0, { damping: 13, stiffness: 150 });
  }, [alza, seleccionada]);

  return useAnimatedStyle(() => ({
    transform: [{ translateY: -16 * alza.value }, { scale: 1 + 0.1 * alza.value }],
  }));
}
