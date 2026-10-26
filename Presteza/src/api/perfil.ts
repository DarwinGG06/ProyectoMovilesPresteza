import type {
  Direccion,
  Pedido,
  PlatoFavorito,
  Reserva,
  TarjetaPago,
  UsuarioPerfil,
} from '@/features/perfil/types';

import { request } from './client';

type RespuestaUsuario = { message?: string; user: UsuarioPerfil };
type RespuestaPedidos = { orders?: Pedido[] } | Pedido[];
type RespuestaTarjetas = { paymentCards?: TarjetaPago[] };
type RespuestaFavoritos = { favorites?: PlatoFavorito[] };

function extraerUsuario(data: RespuestaUsuario | UsuarioPerfil): UsuarioPerfil {
  if (data && typeof data === 'object' && 'user' in data && data.user) {
    return normalizarUsuario(data.user);
  }
  return normalizarUsuario(data as UsuarioPerfil);
}

function cifra(valor: unknown) {
  const n = Number(valor);
  return Number.isFinite(n) ? n : 0;
}

function normalizarUsuario(user: UsuarioPerfil): UsuarioPerfil {
  return {
    ...user,
    id: user.id || user._id || '',
    addresses: user.addresses ?? [],
    paymentCards: user.paymentCards ?? [],
    favoriteDishes: user.favoriteDishes ?? [],
    points: cifra(user.points),
    pointsEarned: cifra(user.pointsEarned),
    pointsRedeemed: cifra(user.pointsRedeemed),
    completedOrders: cifra(user.completedOrders),
    loyaltyTier: user.loyaltyTier || 'Bronce',
  };
}

export async function obtenerUsuario(userId: string) {
  const data = await request<RespuestaUsuario>(`/users/${userId}`);
  return extraerUsuario(data);
}

export async function actualizarPerfilApi(
  userId: string,
  datos: { complete_name?: string; email?: string; phone_number?: string; password?: string },
) {
  const data = await request<RespuestaUsuario>(`/users/${userId}`, {
    method: 'PATCH',
    body: datos,
  });
  return extraerUsuario(data);
}

export async function agregarDireccion(userId: string, direccion: Direccion) {
  const data = await request<RespuestaUsuario>(`/users/${userId}/addresses`, {
    method: 'POST',
    body: direccion,
  });
  return extraerUsuario(data);
}

export async function actualizarDireccion(userId: string, index: number, direccion: Partial<Direccion>) {
  const data = await request<RespuestaUsuario>(`/users/${userId}/addresses/${index}`, {
    method: 'PATCH',
    body: direccion,
  });
  return extraerUsuario(data);
}

export async function eliminarDireccion(userId: string, index: number) {
  const data = await request<RespuestaUsuario>(`/users/${userId}/addresses/${index}`, {
    method: 'DELETE',
  });
  return extraerUsuario(data);
}

export async function marcarDireccionPrincipal(userId: string, index: number) {
  const data = await request<RespuestaUsuario>(`/users/${userId}/addresses/${index}/primary`, {
    method: 'PATCH',
  });
  return extraerUsuario(data);
}

export async function obtenerTarjetas(userId: string, jwt: string) {
  const data = await request<RespuestaTarjetas>(`/users/${userId}/payment-cards`, { token: jwt });
  return data.paymentCards ?? [];
}

export async function agregarTarjeta(userId: string, jwt: string, tarjeta: TarjetaPago) {
  const data = await request<RespuestaUsuario>(`/users/${userId}/payment-cards`, {
    method: 'POST',
    body: tarjeta,
    token: jwt,
  });
  return extraerUsuario(data);
}

export async function eliminarTarjeta(userId: string, jwt: string, index: number) {
  const data = await request<RespuestaUsuario>(`/users/${userId}/payment-cards/${index}`, {
    method: 'DELETE',
    token: jwt,
  });
  return extraerUsuario(data);
}

export async function marcarTarjetaPrincipal(userId: string, jwt: string, index: number) {
  const data = await request<RespuestaUsuario>(`/users/${userId}/payment-cards/${index}/primary`, {
    method: 'PATCH',
    token: jwt,
  });
  return extraerUsuario(data);
}

function normalizarPedido(crudo: Pedido): Pedido {
  const extra = crudo as Pedido & { table_number?: string; delivery_address?: string; fulfillment_type?: string };
  const tipoCrudo = extra.tipo || extra.fulfillment_type;
  return {
    ...crudo,
    tipo: tipoCrudo === 'domicilio' ? 'domicilio' : tipoCrudo === 'mesa' ? 'mesa' : crudo.tipo,
    tableNumber: extra.tableNumber || extra.table_number || null,
    deliveryAddress: extra.deliveryAddress || extra.delivery_address || null,
  };
}

export async function obtenerPedidos(userId: string) {
  const data = await request<RespuestaPedidos>(`/orders/user/${userId}`);
  const lista = Array.isArray(data) ? data : (data.orders ?? []);
  return lista.map(normalizarPedido);
}

export async function obtenerReservas(jwt: string) {
  const data = await request<Reserva[] | Reserva | { reservations?: Reserva[] }>('/reservations/my-reservations', {
    token: jwt,
  });
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && 'reservations' in data && Array.isArray(data.reservations)) {
    return data.reservations;
  }
  if (data && typeof data === 'object' && ('tableNumber' in data || 'date' in data)) {
    return [data as Reserva];
  }
  return [];
}

export async function actualizarReservaPerfil(
  reservaId: string,
  jwt: string,
  datos: { date?: string; time?: string; numberOfPeople?: number; specialRequests?: string },
) {
  return request<Reserva>(`/reservations/${reservaId}`, {
    method: 'PATCH',
    body: datos,
    token: jwt,
  });
}

export async function eliminarReservaPerfil(reservaId: string, jwt: string) {
  await request<void>(`/reservations/${reservaId}`, {
    method: 'DELETE',
    token: jwt,
  });
}

export async function obtenerFavoritos(userId: string, jwt: string) {
  const data = await request<RespuestaFavoritos>(`/users/${userId}/favorites`, { token: jwt });
  return data.favorites ?? [];
}

export function idReserva(reserva: Reserva) {
  return reserva._id || reserva.id || '';
}

export function idPedido(pedido: Pedido) {
  return pedido._id || pedido.id || '';
}
