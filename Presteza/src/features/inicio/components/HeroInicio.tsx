import { useEffect } from 'react';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Plato } from './MesaDecor';

const MESA = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=80';
const COPA = 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80';

export function HeroInicio() {
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

  return (
    <View className="overflow-hidden bg-marca-oscura pb-10 pt-6">
      <View
        pointerEvents="none"
        className="absolute -right-24 top-16 h-80 w-80 rounded-full border-[48px] border-oro/10"
      />
      <View pointerEvents="none" className="absolute -left-16 bottom-8 h-52 w-52 rounded-full bg-marca/40" />

      <View className="flex-row px-4">
        <View className="mr-3 items-center pt-2">
          {'PRESTEZA'.split('').map((letra, index) => (
            <Text key={`${letra}-${index}`} className="text-[12px] leading-[15px] tracking-[3px] text-oro">
              {letra}
            </Text>
          ))}
        </View>

        <View className="flex-1 pr-1">
          <Text className="text-[10px] tracking-[3px] text-oro">RESTAURANTE · MILÁN · MANIZALES</Text>
          <Text className="mt-2 text-[40px] font-light leading-[44px] text-crema">Bienvenido a Presteza.</Text>
          <View className="mt-3 h-px w-16 bg-oro" />
          <Text className="mt-3 text-base italic text-crema/70">Restaurante en el barrio Milán.</Text>
        </View>
      </View>

      <View className="mt-2 h-[420px]">
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              right: -28,
              top: 8,
              width: 328,
              height: 328,
              borderRadius: 164,
              borderWidth: 1,
            },
            halo,
          ]}
        />

        <Animated.View style={[{ position: 'absolute', right: -18, top: 18 }, platoGrande]}>
          <Plato uri={MESA} size={304} />
        </Animated.View>

        <View className="absolute bottom-16 right-8">
          <Plato uri={COPA} size={118} />
        </View>

        <View className="absolute bottom-5 left-5 w-[228px] border border-oro/30 bg-crema px-5 py-5">
          <Text className="text-[10px] tracking-[3px] text-marca">LA CASA</Text>
          <Text className="mt-1 text-xl font-light text-marca-oscura">Cocina de Presteza, hecha con calma.</Text>
          <View className="mt-4 flex-row gap-2">
            <Pressable onPress={() => router.push('/menu')} className="bg-marca-oscura px-5 py-2.5">
              <Text className="text-[11px] tracking-[2px] text-crema">VER MENÚ</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/reservas')} className="border border-marca-oscura px-4 py-2.5">
              <Text className="text-[11px] tracking-[2px] text-marca-oscura">RESERVAR</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
