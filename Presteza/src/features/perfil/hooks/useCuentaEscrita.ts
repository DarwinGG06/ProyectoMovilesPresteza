import { useEffect, useState } from 'react';
import { type LayoutChangeEvent } from 'react-native';
import { Easing, useSharedValue, withTiming } from 'react-native-reanimated';

type Fila = { etiqueta: string; valor: string };

/**
 * Progreso de 0 a 1 que dibuja las filas de la cuenta una tras otra.
 * Se reinicia cuando cambian los datos, no en cada render.
 */
export function useCuentaEscrita(filas: Fila[], animar: boolean) {
  const progreso = useSharedValue(animar ? 0 : 1);
  const firma = filas.map((fila) => `${fila.etiqueta}:${fila.valor}`).join('|');

  useEffect(() => {
    if (!animar) {
      progreso.value = 1;
      return;
    }
    progreso.value = 0;
    progreso.value = withTiming(1, { duration: 1100, easing: Easing.out(Easing.cubic) });
  }, [animar, firma, progreso]);

  return progreso;
}

/** Ancho real de la línea punteada, que solo se conoce al medir el layout. */
export function useAnchoLinea() {
  const [ancho, setAncho] = useState(0);

  const medir = (evento: LayoutChangeEvent) => {
    setAncho(evento.nativeEvent.layout.width);
  };

  return { ancho, medir };
}
