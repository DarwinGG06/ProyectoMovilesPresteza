import { useCallback, useEffect, useState } from 'react';

import { obtenerPrograma } from '@/api/loyalty';

import type { HistorialPuntos, ProgramaFidelidad } from '../types';

function etiquetaMovimiento(item: HistorialPuntos) {
  if (item.type === 'redeem') return 'Canje';
  if (item.type === 'refund') return 'Devolución';
  return 'Acumulado';
}

export function usePuntos(userId: string, token?: string) {
  const [programa, setPrograma] = useState<ProgramaFidelidad | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    if (!userId) return;
    setCargando(true);
    setError(null);
    try {
      setPrograma(await obtenerPrograma(userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el programa de puntos.');
    } finally {
      setCargando(false);
    }
  }, [userId]);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  const historial = (programa?.history ?? []).map((item) => ({
    ...item,
    etiqueta: etiquetaMovimiento(item),
    signo: item.type === 'redeem' ? '-' : '+',
  }));

  return {
    programa,
    historial,
    cargando,
    error,
    recargar,
  };
}
