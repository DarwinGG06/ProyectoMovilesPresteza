import { router } from 'expo-router';
import { Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import Button from '@/components/Button';
import { Pergamino } from '@/shared/components/materiales/Pergamino';

import { useAnimacionHero } from '../hooks/useAnimacionHero';
import { Plato } from './MesaDecor';

const MESA = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=80';
const COPA = 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80';

export function HeroInicio() {
  const { platoGrande, halo } = useAnimacionHero();

  return (
    <View className="overflow-hidden bg-marca-oscura pb-10 pt-6">
      <View className="flex-row px-4">
        <View className="mr-3 items-center pt-2">
          {'PRESTEZA'.split('').map((letra, index) => (
            <Text
              key={`${letra}-${index}`}
              className="font-roboto text-[12px] leading-[15px] tracking-[3px] text-oro">
              {letra}
            </Text>
          ))}
        </View>

        <View className="flex-1 pr-1">
          <Text className="font-roboto text-[10px] tracking-[3px] text-oro">
            RESTAURANTE · MILÁN · MANIZALES
          </Text>
          <Text className="mt-2 font-serif-light text-[42px] leading-[46px] text-crema">
            Bienvenido a Presteza.
          </Text>
          <View className="mt-3 h-px w-16 bg-oro" />
          <Text className="mt-3 font-serif-italic text-lg text-crema/70">
            Restaurante en el barrio Milán.
          </Text>
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

        <View className="absolute bottom-5 left-5 w-[248px] overflow-hidden">
          <Pergamino>
            <View className="px-5 py-5">
              <Text className="font-roboto text-[10px] tracking-[3px] text-marca">LA CASA</Text>
              <Text className="mt-1 font-serif text-xl text-tinta">
                La carta de la casa, servida en mesa.
              </Text>
              <View className="mt-4 flex-row items-stretch">
                <Button
                  text="VER MENÚ"
                  compact
                  onPress={() => router.push('/home/menu')}
                  className="mr-2 flex-1"
                />
                <Button
                  text="RESERVAR"
                  compact
                  variant="gold"
                  onPress={() => router.push('/home/reservas')}
                  className="flex-1"
                />
              </View>
            </View>
          </Pergamino>
        </View>
      </View>
    </View>
  );
}
