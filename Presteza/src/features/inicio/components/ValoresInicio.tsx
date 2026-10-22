import { Text, View } from 'react-native';

import { Pergamino } from '@/shared/components/materiales/Pergamino';

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
        <View key={valor.titulo} className="mb-4 overflow-hidden">
          <Pergamino>
            <View className="px-5 py-5">
              <Text className="font-roboto text-[10px] tracking-[3px] text-marca">
                0{index + 1}
              </Text>
              <Text className="mt-2 font-serif-light text-2xl text-tinta">{valor.titulo}</Text>
              <Text className="mt-2 font-roboto text-[15px] leading-6 text-tinta/60">
                {valor.texto}
              </Text>
            </View>
          </Pergamino>
        </View>
      ))}
    </View>
  );
}
