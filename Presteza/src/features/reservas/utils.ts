import type { Mesa, Reserva, ReservaDatos, ReservaForm } from './types';

export function idReserva(reserva?: { _id?: string; id?: string }) {
  return reserva?._id || reserva?.id || '';
}

export function textoEstadoReserva(status: string) {
  const mapa: Record<string, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    cancelled: 'Cancelada',
    completed: 'Completada',
  };
  return mapa[status] ?? status;
}

export function sePuedeEditar(reserva: Reserva) {
  return reserva.status === 'pending' || reserva.status === 'confirmed';
}

export function estaActiva(reserva: Reserva) {
  return reserva.status === 'pending' || reserva.status === 'confirmed';
}

export function valoresReserva(reserva?: Reserva): ReservaForm {
  return {
    tableNumber: reserva?.tableNumber ?? '',
    date: reserva?.date ?? '',
    time: reserva?.time ?? '',
    numberOfPeople: reserva ? String(reserva.numberOfPeople) : '',
    specialRequests: reserva?.specialRequests ?? '',
  };
}

export function datosDeFormulario(datos: ReservaForm): ReservaDatos {
  return {
    tableNumber: datos.tableNumber.trim(),
    date: datos.date.trim(),
    time: datos.time.trim(),
    numberOfPeople: Number(datos.numberOfPeople),
    specialRequests: datos.specialRequests.trim() || undefined,
  };
}

export function mesaOcupada(
  reservas: Reserva[],
  mesa: string,
  date: string,
  time: string,
  excepto?: string,
) {
  return reservas.some(
    (reserva) =>
      estaActiva(reserva) &&
      reserva.tableNumber === mesa &&
      reserva.date === date &&
      reserva.time === time &&
      idReserva(reserva) !== excepto,
  );
}

export function mesasDisponibles(
  mesas: Mesa[],
  reservas: Reserva[],
  date: string,
  time: string,
  personas = 0,
  excepto?: string,
) {
  return mesas.filter((mesa) => {
    if (mesa.active === false) return false;
    if (mesa.status === 'maintenance') return false;
    if (personas > 0 && mesa.capacity < personas) return false;
    if (date && time && mesaOcupada(reservas, mesa.number, date, time, excepto)) return false;
    return true;
  });
}

export function ordenarReservas(reservas: Reserva[]) {
  return [...reservas].sort(
    (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
  );
}
