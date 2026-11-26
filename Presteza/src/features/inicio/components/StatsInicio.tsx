import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { useContadorStats, type StatInicio } from '../hooks/useContadorStats';
import { MarcaCurso } from './MesaDecor';

type Props = {
  totalPlatos: number;
  totalCategorias: number;
  cargando: boolean;
};

export function StatsInicio({ totalPlatos, totalCategorias, cargando }: Props) {
  const estadisticas = useMemo<StatInicio[]>(() => {
    const platos = Math.max(0, totalPlatos);
    const cats = Math.max(0, totalCategorias);
    return [
      {
        icono: 'cafe-outline',
        valor: platos,
        sufijo: '',
        etiqueta: 'Platos en carta',
        max: Math.max(platos, 1),
      },
      {
        icono: 'grid-outline',
        valor: cats,
        sufijo: '',
        etiqueta: 'Categorías',
        max: Math.max(cats, 1),
      },
    ];
  }, [totalCategorias, totalPlatos]);

  const visibles = useContadorStats(estadisticas);

  return (
    <View className="bg-marca-oscura px-5 pb-12">
      <MarcaCurso numero="IV" nombre="PRESTEZA EN CIFRAS" />
      <Text className="mb-6 font-roboto text-sm text-crema/70">
        Lo que hay hoy en la casa, según la carta.
      </Text>

      {cargando ? (
        <Text className="font-roboto text-sm text-crema/70">Contando la carta…</Text>
      ) : (
        <View className="mb-3 flex-row gap-3">
          {estadisticas.map((stat, index) => {
            const entero = stat.valor % 1 === 0;
            const valor = visibles[index] ?? 0;
            const mostrado = entero ? Math.floor(valor).toString() : valor.toFixed(1);
            const porcentaje = Math.min(100, (valor / stat.max) * 100);

            return (
              <View key={stat.etiqueta} className="flex-1 border border-oro/25 px-3 py-4">
                <Text className="font-roboto text-[12px] tracking-[2px] text-oro/70">
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
      )}
    </View>
  );
}
