import { Text, View } from 'react-native';

import { useContadorStats } from '../hooks/useContadorStats';
import { ESTADISTICAS } from '../data';
import { MarcaCurso } from './MesaDecor';

const FILAS = [ESTADISTICAS.slice(0, 2), ESTADISTICAS.slice(2, 4)];

export function StatsInicio() {
  const visibles = useContadorStats();

  return (
    <View className="bg-marca-oscura px-5 pb-12">
      <MarcaCurso numero="IV" nombre="PRESTEZA EN CIFRAS" />
      <Text className="mb-6 font-roboto text-sm text-crema/55">
        Lo que hemos construido en Manizales.
      </Text>

      {FILAS.map((fila, filaIndex) => (
        <View key={filaIndex} className="mb-3 flex-row gap-3">
          {fila.map((stat) => {
            const index = ESTADISTICAS.indexOf(stat);
            const entero = stat.valor % 1 === 0;
            const mostrado = entero
              ? Math.floor(visibles[index]).toString()
              : visibles[index].toFixed(1);
            const porcentaje = Math.min(100, (visibles[index] / stat.max) * 100);

            return (
              <View key={stat.etiqueta} className="flex-1 border border-oro/25 px-3 py-4">
                <Text className="font-roboto text-[10px] tracking-[2px] text-oro/70">
                  0{index + 1}
                </Text>
                <Text className="mt-2 font-roboto-light text-3xl text-oro">
                  {mostrado}
                  {stat.sufijo}
                </Text>
                <Text className="mt-1 font-roboto text-[12px] leading-4 text-crema/80">
                  {stat.etiqueta}
                </Text>
                <View className="mt-4 h-px bg-oro/20">
                  <View className="h-px bg-oro" style={{ width: `${porcentaje}%` }} />
                </View>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}
