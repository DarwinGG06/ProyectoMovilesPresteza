import { useEffect, useState } from 'react';

export type StatInicio = {
  icono: 'people-outline' | 'cafe-outline' | 'grid-outline' | 'star-outline' | 'time-outline';
  valor: number;
  sufijo: string;
  etiqueta: string;
  max: number;
};

const PASOS = 40;
const MS_POR_PASO = 30;
const RETRASO_ENTRE_CIFRAS = 140;

/** Lleva cada cifra de 0 a su valor final, una detrás de otra. */
export function useContadorStats(estadisticas: StatInicio[]) {
  const [visibles, setVisibles] = useState(() => estadisticas.map(() => 0));

  useEffect(() => {
    setVisibles(estadisticas.map(() => 0));
    if (!estadisticas.length) return;

    const intervalos: ReturnType<typeof setInterval>[] = [];

    const temporizadores = estadisticas.map((stat, index) => {
      const incremento = (stat.valor || 0) / PASOS;
      let actual = 0;
      let paso = 0;

      return setTimeout(() => {
        const intervalo = setInterval(() => {
          paso += 1;
          actual += incremento;
          setVisibles((prev) => {
            const copia = [...prev];
            while (copia.length < estadisticas.length) copia.push(0);
            copia[index] = paso >= PASOS ? stat.valor : actual;
            return copia;
          });
          if (paso >= PASOS) clearInterval(intervalo);
        }, MS_POR_PASO);

        intervalos.push(intervalo);
      }, index * RETRASO_ENTRE_CIFRAS);
    });

    return () => {
      temporizadores.forEach(clearTimeout);
      intervalos.forEach(clearInterval);
    };
  }, [estadisticas]);

  return visibles;
}
