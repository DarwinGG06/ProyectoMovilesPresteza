import { useEffect, useRef } from 'react';
import { ScrollView } from 'react-native';

import type { PestanaAdmin } from '../types';

/**
 * Mantiene visible la pestaña activa en la barra horizontal
 * y evita que el scroll vuelva al inicio al cambiar de ruta.
 */
export function useBarraPestanas(activa: PestanaAdmin) {
  const scrollRef = useRef<ScrollView>(null);
  const posiciones = useRef<Partial<Record<PestanaAdmin, number>>>({});

  const registrar = (id: PestanaAdmin, x: number) => {
    posiciones.current[id] = x;
  };

  useEffect(() => {
    const x = posiciones.current[activa];
    if (x == null) return;
    scrollRef.current?.scrollTo({ x: Math.max(0, x - 20), animated: true });
  }, [activa]);

  return { scrollRef, registrar };
}
