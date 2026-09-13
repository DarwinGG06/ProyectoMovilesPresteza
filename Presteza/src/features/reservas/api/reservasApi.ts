import { pedirApi } from '@/services/api/cliente';

import type { AlcanceReservas, Mesa, Reserva, ReservaDatos } from '../types';
import { idReserva } from '../utils';

function lista<T>(data: unknown, ...claves: string[]): T[] {
  if (Array.isArray(data)) return data as T[];
  if (!data || typeof data !== 'object') return [];

  const obj = data as Record<string, unknown>;
  for (const clave of claves) {
    const valor = obj[clave];
    if (Array.isArray(valor)) return valor as T[];
  }

  const anidado = Object.values(obj).find((valor) => Array.isArray(valor));
  if (anidado) return anidado as T[];

  const llaves = Object.keys(obj);
  if (llaves.length && llaves.every((clave) => /^\d+$/.test(clave))) {
    return llaves.sort((a, b) => Number(a) - Number(b)).map((clave) => obj[clave]) as T[];
  }

  return [];
}

function texto(valor: unknown) {
  if (typeof valor === 'string') return valor;
  if (typeof valor === 'number' && Number.isFinite(valor)) return String(valor);
  if (valor && typeof valor === 'object' && 'toString' in valor) {
    const id = String(valor);
    if (id && id !== '[object Object]') return id;
  }
  return '';
}

function entidad(data: unknown, ...claves: string[]): Record<string, unknown> {
  if (!data || typeof data !== 'object') return {};
  const obj = data as Record<string, unknown>;
  for (const clave of claves) {
    const valor = obj[clave];
    if (valor && typeof valor === 'object' && !Array.isArray(valor)) {
      return valor as Record<string, unknown>;
    }
  }
  return obj;
}

export function normalizarReserva(crudo: Record<string, unknown>): Reserva {
  return {
    _id: texto(crudo._id) || undefined,
    id: texto(crudo.id) || undefined,
    tableNumber: texto(crudo.tableNumber) || texto(crudo.table_number),
    date: texto(crudo.date),
    time: texto(crudo.time),
    numberOfPeople: Number(crudo.numberOfPeople ?? crudo.number_of_people) || 0,
    specialRequests: texto(crudo.specialRequests) || texto(crudo.special_requests) || undefined,
    status: texto(crudo.status) || 'pending',
    userId: texto(crudo.userId) || texto(crudo.user_id) || undefined,
    userName: texto(crudo.userName) || texto(crudo.user_name) || undefined,
    userEmail: texto(crudo.userEmail) || texto(crudo.user_email) || undefined,
    createdAt: texto(crudo.createdAt) || texto(crudo.created_at) || undefined,
  };
}

function normalizarMesa(crudo: Record<string, unknown>): Mesa {
  return {
    _id: texto(crudo._id) || undefined,
    id: texto(crudo.id) || undefined,
    number: texto(crudo.number),
    capacity: Number(crudo.capacity) || 0,
    active: crudo.active !== false,
    status: texto(crudo.status) || undefined,
  };
}

function esReserva(data: unknown) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false;
  const obj = data as Record<string, unknown>;
  return Boolean(obj.tableNumber || obj.table_number || obj.date);
}

export async function listarReservas(token: string, alcance: AlcanceReservas = 'mias') {
  const ruta = alcance === 'todas' ? '/reservations' : '/reservations/my-reservations';
  const data = await pedirApi(ruta, { token });
  const crudos = lista<Record<string, unknown>>(data, 'reservations');
  if (crudos.length) return crudos.map(normalizarReserva);
  if (esReserva(data)) return [normalizarReserva(data as Record<string, unknown>)];
  return [];
}

export async function crearReserva(token: string, datos: ReservaDatos) {
  const respuesta = await pedirApi('/reservations', { method: 'POST', token, body: { ...datos } });
  return normalizarReserva(entidad(respuesta, 'reservation'));
}

export async function actualizarReserva(token: string, id: string, datos: Partial<ReservaDatos>) {
  const respuesta = await pedirApi(`/reservations/${id}`, { method: 'PATCH', token, body: { ...datos } });
  return normalizarReserva(entidad(respuesta, 'reservation'));
}

export async function cambiarEstadoReserva(
  token: string,
  id: string,
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed',
) {
  const respuesta = await pedirApi(`/reservations/${id}/status`, {
    method: 'PATCH',
    token,
    body: { status },
  });
  return normalizarReserva(entidad(respuesta, 'reservation'));
}

export function eliminarReserva(token: string, id: string) {
  return pedirApi<void>(`/reservations/${id}`, { method: 'DELETE', token });
}

export async function listarMesas() {
  const crudos = lista<Record<string, unknown>>(await pedirApi('/tables'), 'tables');
  return crudos.map(normalizarMesa);
}

export function idDeReserva(reserva: Reserva) {
  return idReserva(reserva);
}
