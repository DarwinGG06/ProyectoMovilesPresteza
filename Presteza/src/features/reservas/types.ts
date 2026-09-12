export type EstadoReserva = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export type Reserva = {
  _id?: string;
  id?: string;
  tableNumber: string;
  date: string;
  time: string;
  numberOfPeople: number;
  specialRequests?: string;
  status: EstadoReserva | string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  createdAt?: string;
};

export type Mesa = {
  _id?: string;
  id?: string;
  number: string;
  capacity: number;
  active?: boolean;
  status?: string;
};

export type ReservaForm = {
  tableNumber: string;
  date: string;
  time: string;
  numberOfPeople: string;
  specialRequests: string;
};

export type ReservaDatos = {
  tableNumber: string;
  date: string;
  time: string;
  numberOfPeople: number;
  specialRequests?: string;
};

export type AlcanceReservas = 'mias' | 'todas';
