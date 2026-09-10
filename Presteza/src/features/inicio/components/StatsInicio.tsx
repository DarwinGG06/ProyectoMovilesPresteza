import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { ESTADISTICAS } from '../data';
import { MarcaCurso } from './MesaDecor';

const FILAS = [ESTADISTICAS.slice(0, 2), ESTADISTICAS.slice(2, 4)];

export function StatsInicio() {
  const [visibles, setVisibles] = useState(ESTADISTICAS.map(() => 0));

  useEffect(() => {
    const timers = ESTADISTICAS.map((stat, index) => {
      const pasos = 40;
      const incremento = stat.valor / pasos;
      let actual = 0;
      let paso = 0;

      return setTimeout(() => {
        const intervalo = setInterval(() => {
          paso += 1;
          actual += incremento;
          setVisibles((prev) => {
            const copia = [...prev];
            copia[index] = paso >= pasos ? stat.valor : actual;
            return copia;
          });
          if (paso >= pasos) clearInterval(intervalo);
        }, 30);
      }, index * 140);
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <View className="bg-marca-oscura px-5 pb-12">
      <MarcaCurso numero="IV" nombre="PRESTEZA EN CIFRAS" />
      <Text className="mb-6 text-sm text-crema/55">Lo que hemos construido en Manizales.</Text>

      {FILAS.map((fila, filaIndex) => (
        <View key={filaIndex} className="mb-3 flex-row gap-3">
          {fila.map((stat) => {
            const index = ESTADISTICAS.indexOf(stat);
            const entero = stat.valor % 1 === 0;
            const mostrado = entero ? Math.floor(visibles[index]).toString() : visibles[index].toFixed(1);
            const porcentaje = Math.min(100, (visibles[index] / stat.max) * 100);

            return (
              <View key={stat.etiqueta} className="flex-1 border border-oro/25 px-3 py-4">
                <Text className="text-[10px] tracking-[2px] text-oro/70">0{index + 1}</Text>
                <Text className="mt-2 text-3xl font-light text-oro">
                  {mostrado}
                  {stat.sufijo}
                </Text>
                <Text className="mt-1 text-[12px] leading-4 text-crema/80">{stat.etiqueta}</Text>
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
