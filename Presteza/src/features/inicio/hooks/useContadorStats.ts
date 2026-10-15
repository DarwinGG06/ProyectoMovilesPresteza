import { useEffect, useState } from 'react';

import { ESTADISTICAS } from '../data';

const PASOS = 40;
const MS_POR_PASO = 30;
const RETRASO_ENTRE_CIFRAS = 140;

/** Lleva cada cifra de 0 a su valor final, una detrás de otra. */
export function useContadorStats() {
  const [visibles, setVisibles] = useState(ESTADISTICAS.map(() => 0));

  useEffect(() => {
    const intervalos: ReturnType<typeof setInterval>[] = [];

    const temporizadores = ESTADISTICAS.map((stat, index) => {
      const incremento = stat.valor / PASOS;
      let actual = 0;
      let paso = 0;

      return setTimeout(() => {
        const intervalo = setInterval(() => {
          paso += 1;
          actual += incremento;
          setVisibles((prev) => {
            const copia = [...prev];
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
  }, []);

  return visibles;
}
