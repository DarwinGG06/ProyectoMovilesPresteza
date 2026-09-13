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

function normalizarFecha(fecha: string) {
  const iso = fecha.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`;
  return fecha.trim();
}

function horaAmPm(hora: number, minutos: string) {
  if (hora === 0) return `12:${minutos} a. m.`;
  if (hora === 12) return `12:${minutos} p. m.`;
  if (hora > 12) return `${hora - 12}:${minutos} p. m.`;
  return `${hora}:${minutos} a. m.`;
}

function normalizarHora(hora: string) {
  const limpia = hora.trim().toLowerCase().replace(/\s+/g, ' ');
  const formato24 = limpia.match(/^(\d{1,2}):(\d{2})$/);
  if (formato24) return horaAmPm(Number(formato24[1]), formato24[2]);
  return limpia.replace(/a\.?\s*m\.?/, 'a. m.').replace(/p\.?\s*m\.?/, 'p. m.');
}

export function mesaOcupada(
  reservas: Reserva[],
  mesa: string,
  date: string,
  time: string,
  excepto?: string,
) {
  const fecha = normalizarFecha(date);
  const hora = normalizarHora(time);
  return reservas.some(
    (reserva) =>
      estaActiva(reserva) &&
      reserva.tableNumber === mesa &&
      normalizarFecha(reserva.date) === fecha &&
      normalizarHora(reserva.time) === hora &&
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

export function fusionarReserva(lista: Reserva[], actual: Reserva, extra: Partial<Reserva> = {}) {
  const id = idReserva(actual);
  return lista.map((item) => (idReserva(item) === id ? { ...item, ...actual, ...extra } : item));
}

export function fechaHoy() {
  const hoy = new Date();
  const dia = String(hoy.getDate()).padStart(2, '0');
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}/${hoy.getFullYear()}`;
}

export function avisoCambioEstado(
  reserva: Reserva,
  status: 'confirmed' | 'cancelled' | 'completed',
) {
  return {
    cancelled: {
      titulo: 'Cancelar reserva',
      texto: `¿Cancelar la mesa ${reserva.tableNumber}?`,
      confirmar: 'CANCELAR RESERVA',
      listo: 'Reserva cancelada',
      detalle: `La mesa ${reserva.tableNumber} fue cancelada.`,
    },
    confirmed: {
      titulo: 'Confirmar reserva',
      texto: `¿Confirmar la mesa ${reserva.tableNumber}?`,
      confirmar: 'CONFIRMAR',
      listo: 'Reserva confirmada',
      detalle: `La mesa ${reserva.tableNumber} fue confirmada.`,
    },
    completed: {
      titulo: 'Completar reserva',
      texto: `¿Marcar la mesa ${reserva.tableNumber} como completada?`,
      confirmar: 'COMPLETAR',
      listo: 'Reserva completada',
      detalle: `La mesa ${reserva.tableNumber} fue completada.`,
    },
  }[status];
}
