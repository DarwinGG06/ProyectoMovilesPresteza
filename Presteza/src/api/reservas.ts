import type { AlcanceReservas, Mesa, Reserva, ReservaDatos } from '../types';
import { request } from './client';
import { entidad, lista, texto } from './helpers';

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

export async function listarReservas(jwt: string, alcance: AlcanceReservas = 'mias') {
  const ruta = alcance === 'todas' ? '/reservations' : '/reservations/my-reservations';
  const data = await request(ruta, { token: jwt });
  const crudos = lista<Record<string, unknown>>(data, 'reservations');
  if (crudos.length) return crudos.map(normalizarReserva);
  if (esReserva(data)) return [normalizarReserva(data as Record<string, unknown>)];
  return [];
}

export async function crearReserva(jwt: string, datos: ReservaDatos) {
  const respuesta = await request('/reservations', { method: 'POST', token: jwt, body: { ...datos } });
  return normalizarReserva(entidad(respuesta, 'reservation'));
}

export async function actualizarReserva(jwt: string, id: string, datos: Partial<ReservaDatos>) {
  const respuesta = await request(`/reservations/${id}`, { method: 'PATCH', token: jwt, body: { ...datos } });
  return normalizarReserva(entidad(respuesta, 'reservation'));
}

export async function cambiarEstadoReserva(
  jwt: string,
  id: string,
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed',
) {
  const respuesta = await request(`/reservations/${id}/status`, {
    method: 'PATCH',
    token: jwt,
    body: { status },
  });
  return normalizarReserva(entidad(respuesta, 'reservation'));
}

export function eliminarReserva(jwt: string, id: string) {
  return request<void>(`/reservations/${id}`, { method: 'DELETE', token: jwt });
}

export async function listarMesas() {
  const crudos = lista<Record<string, unknown>>(await request('/tables'), 'tables');
  return crudos.map(normalizarMesa);
}
