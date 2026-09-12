import { listarReservas } from '@/features/reservas/api/reservasApi';

import type { ReservaAdmin } from '../types';
import { useListaAdmin } from './adminComun';

function listarTodas(token: string) {
  return listarReservas(token, 'todas').catch(() => [] as ReservaAdmin[]);
}

export function useAdminReservasLista() {
  const { lista: reservas, setLista, cargando, error, recargar } = useListaAdmin(listarTodas);

  return { reservas, setReservas: setLista, cargando, error, recargar };
}
