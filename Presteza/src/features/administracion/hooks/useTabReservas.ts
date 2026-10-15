import { useState } from 'react';

import type { CasaReservas } from '@/features/reservas/hooks/useReservas';
import type { Reserva } from '@/features/reservas/types';

type DatosReserva = Parameters<CasaReservas['guardar']>[0];

/**
 * Estado de interfaz del tab de reservas.
 * El filtro y la lista filtrada viven en `casaReservas` (hook de datos), por eso aquí no se duplican.
 */
export function useTabReservas(reservas: CasaReservas) {
  const [vista, setVista] = useState<'lista' | 'cuadricula'>('lista');
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(true);
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState<Reserva | null>(null);

  const abrir = (reserva?: Reserva) => {
    setEditando(reserva ?? null);
    setAbierto(true);
  };

  const cerrar = () => setAbierto(false);

  const guardar = async (datos: DatosReserva) => {
    if (await reservas.guardar(datos, editando)) setAbierto(false);
  };

  return {
    vista,
    setVista,
    filtrosAbiertos,
    setFiltrosAbiertos,
    abierto,
    editando,
    abrir,
    cerrar,
    guardar,
    valoresFormulario: reservas.valoresDe(editando ?? undefined),
  };
}
