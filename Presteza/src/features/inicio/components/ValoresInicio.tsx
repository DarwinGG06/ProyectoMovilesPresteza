import { Text, View } from 'react-native';

import { VALORES } from '../data';
import { MarcaCurso } from './MesaDecor';

export function ValoresInicio() {
  return (
    <View className="bg-marca-oscura px-5 pb-12">
      <MarcaCurso numero="I" nombre="NUESTRA CASA" />
      <Text className="mb-6 font-roboto text-sm text-crema/55">
        Tres razones para sentarse en Presteza.
      </Text>

      {VALORES.map((valor, index) => (
        <View key={valor.titulo} className="relative mb-5 border border-oro/15 bg-crema px-5 py-5">
          <View className="absolute -top-px left-8 h-0.5 w-12 bg-oro" />
          <Text className="font-roboto text-[10px] tracking-[3px] text-oro">0{index + 1}</Text>
          <Text className="mt-2 font-roboto-light text-2xl text-marca-oscura">{valor.titulo}</Text>
          <Text className="mt-2 font-roboto text-[15px] leading-6 text-texto/70">
            {valor.texto}
          </Text>
        </View>
      ))}
    </View>
  );
}
