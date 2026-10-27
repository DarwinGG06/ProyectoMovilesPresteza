import { Pressable, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Pergamino } from '@/shared/components/materiales/Pergamino';
import { IconoNav } from '@/shared/components/nav-bar/IconoNav';

import { useEntradaHero } from '../hooks/useEntradaHero';
import { iniciales } from '../utils';
import { SelloIniciales } from './SelloIniciales';

type HeroPerfilProps = {
  nombre: string;
  email: string;
  puntos?: number;
  nivel?: string;
  onAjustes: () => void;
};

export function HeroPerfil({ nombre, email, puntos, nivel, onAjustes }: HeroPerfilProps) {
  const estilo = useEntradaHero();
  const saldo = typeof puntos === 'number' ? puntos : 0;

  return (
    <View className="px-6 pt-8">
      <Text className="font-roboto text-[10px] tracking-[4px] text-oro">MI CUENTA</Text>
      <View className="mt-2 h-px w-10 bg-oro" />

      <Animated.View style={estilo} className="mt-6 overflow-hidden rounded-[32px]">
        <Pergamino>
          <View className="px-6 pb-8 pt-5">
            <View className="mb-2 flex-row justify-end">
              <Pressable
                onPress={onAjustes}
                accessibilityRole="button"
                accessibilityLabel="Ajustes"
                className="h-12 w-12 items-center justify-center rounded-full bg-marca/8">
                <IconoNav name="settings-outline" size={20} className="text-marca" />
              </Pressable>
            </View>

            <View className="items-center">
              <SelloIniciales letras={iniciales(nombre)} />
              <Text className="mt-5 text-center font-serif-light text-[32px] leading-[36px] text-tinta">
                {nombre}
              </Text>
              <Text className="mt-2 font-roboto text-sm text-tinta/50">{email}</Text>
              <View className="mt-5 rounded-full bg-marca-oscura px-5 py-2">
                <Text className="font-roboto text-[10px] tracking-[2px] text-oro">
                  {(nivel || 'Bronce').toUpperCase()}  ·  {saldo} PTS
                </Text>
              </View>
            </View>
          </View>
        </Pergamino>
      </Animated.View>
    </View>
  );
}
