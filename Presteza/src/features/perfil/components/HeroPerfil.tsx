import { Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { useEntradaHero } from '../hooks/useEntradaHero';
import { iniciales, primerNombre } from '../utils';

type HeroPerfilProps = {
  nombre: string;
  email: string;
  miembroDesde?: string;
};

export function HeroPerfil({ nombre, email, miembroDesde }: HeroPerfilProps) {
  const estilo = useEntradaHero();
  const corto = primerNombre(nombre);

  return (
    <View className="bg-marca-oscura px-6 pb-8 pt-7">
      <Text className="font-roboto text-[10px] tracking-[3px] text-oro">PRESTEZA · MILÁN</Text>

      <Animated.View style={estilo} className="mt-5 flex-row items-center justify-between gap-4">
        <View className="min-w-0 flex-1">
          <Text className="font-roboto-light text-[36px] leading-[40px] text-white">{corto}</Text>
          {nombre.trim() !== corto ? (
            <Text className="mt-1 font-roboto-light text-sm text-crema/60">{nombre}</Text>
          ) : null}

          <View className="mt-4 h-px w-12 bg-oro" />
          <Text className="mt-4 font-roboto text-base italic text-crema">{email}</Text>

          {miembroDesde ? (
            <Text className="mt-5 font-roboto text-[11px] tracking-[1px] text-crema/80">
              Cliente desde {miembroDesde}
            </Text>
          ) : null}
        </View>

        <View className="h-[76px] w-[76px] items-center justify-center rounded-full border border-oro/35">
          <View className="h-16 w-16 items-center justify-center rounded-full border border-oro bg-oro/15">
            <Text className="font-roboto-light text-[26px] tracking-[1px] text-oro">
              {iniciales(nombre) || 'P'}
            </Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
