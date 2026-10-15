import { router } from 'expo-router';
import { useState } from 'react';

import { useReservas } from '@/features/reservas/hooks/useReservas';
import type { Reserva } from '@/features/reservas/types';

import type { ReservaForm } from '../types';

export function useReservasPerfil(onCambio?: (reservas: Reserva[]) => void) {
  const [editando, setEditando] = useState<Reserva | null>(null);
  const reservas = useReservas({ alcance: 'mias', onCambio });

  // La mesa no se puede cambiar desde aquí: se reenvía la que ya tenía.
  const guardar = async (datos: ReservaForm) => {
    if (!editando) return;

    const ok = await reservas.editar(editando, {
      tableNumber: editando.tableNumber,
      date: datos.date,
      time: datos.time,
      numberOfPeople: datos.numberOfPeople,
      specialRequests: datos.specialRequests,
    });
    if (ok) setEditando(null);
  };

  // Se devuelve la mesa y los valores juntos para que la pestaña compruebe
  // una sola condición antes de pintar el formulario.
  const edicion = editando
    ? {
        mesa: editando.tableNumber,
        valores: {
          date: editando.date,
          time: editando.time,
          numberOfPeople: String(editando.numberOfPeople),
          specialRequests: editando.specialRequests ?? '',
        } satisfies ReservaForm,
      }
    : null;

  return {
    lista: reservas.lista,
    error: reservas.error,
    guardando: reservas.guardando,
    idDe: reservas.idDe,
    textoEstado: reservas.textoEstado,
    sePuedeEditar: reservas.sePuedeEditar,
    eliminar: reservas.eliminar,
    edicion,
    editar: setEditando,
    cancelar: () => setEditando(null),
    guardar,
    irAReservas: () => router.push('/reservas'),
  };
}
