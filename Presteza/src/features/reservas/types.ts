export type {
  AlcanceReservas,
  EstadoReserva,
  Mesa,
  Reserva,
  ReservaDatos,
} from '@/types';

export type ReservaForm = {
  tableNumber: string;
  date: string;
  time: string;
  numberOfPeople: string;
  specialRequests: string;
};

export type MesaPlano = {
  id: string;
  capacity: number;
  x: number;
  y: number;
};

export type MesaVisual = MesaPlano & {
  available: boolean;
};

export type SeleccionReserva =
  | { tipo: 'mesa'; mesa: MesaVisual }
  | { tipo: 'barra' }
  | { tipo: 'custom' }
  | null;
