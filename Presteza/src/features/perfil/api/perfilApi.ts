import { pedirApi } from '@/services/api/cliente';

import type {
  Direccion,
  Pedido,
  PlatoFavorito,
  Reserva,
  TarjetaPago,
  UsuarioPerfil,
} from '../types';

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

function normalizarUsuario(user: UsuarioPerfil): UsuarioPerfil {
  return {
    ...user,
    id: user.id || user._id || '',
    addresses: user.addresses ?? [],
    paymentCards: user.paymentCards ?? [],
    favoriteDishes: user.favoriteDishes ?? [],
  };
}

export async function obtenerUsuario(userId: string) {
  const data = await pedirApi<RespuestaUsuario>(`/users/${userId}`);
  return extraerUsuario(data);
}

export async function actualizarPerfilApi(
  userId: string,
  datos: { complete_name?: string; email?: string; phone_number?: string; password?: string },
) {
  const data = await pedirApi<RespuestaUsuario>(`/users/${userId}`, {
    method: 'PATCH',
    body: datos,
  });
  return extraerUsuario(data);
}

export async function agregarDireccion(userId: string, direccion: Direccion) {
  const data = await pedirApi<RespuestaUsuario>(`/users/${userId}/addresses`, {
    method: 'POST',
    body: direccion,
  });
  return extraerUsuario(data);
}

export async function actualizarDireccion(userId: string, index: number, direccion: Partial<Direccion>) {
  const data = await pedirApi<RespuestaUsuario>(`/users/${userId}/addresses/${index}`, {
    method: 'PATCH',
    body: direccion,
  });
  return extraerUsuario(data);
}

export async function eliminarDireccion(userId: string, index: number) {
  const data = await pedirApi<RespuestaUsuario>(`/users/${userId}/addresses/${index}`, {
    method: 'DELETE',
  });
  return extraerUsuario(data);
}

export async function marcarDireccionPrincipal(userId: string, index: number) {
  const data = await pedirApi<RespuestaUsuario>(`/users/${userId}/addresses/${index}/primary`, {
    method: 'PATCH',
  });
  return extraerUsuario(data);
}

export async function obtenerTarjetas(userId: string, token: string) {
  const data = await pedirApi<RespuestaTarjetas>(`/users/${userId}/payment-cards`, { token });
  return data.paymentCards ?? [];
}

export async function agregarTarjeta(userId: string, token: string, tarjeta: TarjetaPago) {
  const data = await pedirApi<RespuestaUsuario>(`/users/${userId}/payment-cards`, {
    method: 'POST',
    body: tarjeta,
    token,
  });
  return extraerUsuario(data);
}

export async function eliminarTarjeta(userId: string, token: string, index: number) {
  const data = await pedirApi<RespuestaUsuario>(`/users/${userId}/payment-cards/${index}`, {
    method: 'DELETE',
    token,
  });
  return extraerUsuario(data);
}

export async function marcarTarjetaPrincipal(userId: string, token: string, index: number) {
  const data = await pedirApi<RespuestaUsuario>(`/users/${userId}/payment-cards/${index}/primary`, {
    method: 'PATCH',
    token,
  });
  return extraerUsuario(data);
}

export async function obtenerPedidos(userId: string) {
  const data = await pedirApi<RespuestaPedidos>(`/orders/user/${userId}`);
  if (Array.isArray(data)) return data;
  return data.orders ?? [];
}

export async function obtenerReservas(token: string) {
  const data = await pedirApi<Reserva[] | Reserva | { reservations?: Reserva[] }>('/reservations/my-reservations', {
    token,
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

export async function actualizarReserva(
  reservaId: string,
  token: string,
  datos: { date?: string; time?: string; numberOfPeople?: number; specialRequests?: string },
) {
  return pedirApi<Reserva>(`/reservations/${reservaId}`, {
    method: 'PATCH',
    body: datos,
    token,
  });
}

export async function eliminarReserva(reservaId: string, token: string) {
  await pedirApi<void>(`/reservations/${reservaId}`, {
    method: 'DELETE',
    token,
  });
}

export async function obtenerFavoritos(userId: string, token: string) {
  const data = await pedirApi<RespuestaFavoritos>(`/users/${userId}/favorites`, { token });
  return data.favorites ?? [];
}

export function idReserva(reserva: Reserva) {
  return reserva._id || reserva.id || '';
}

export function idPedido(pedido: Pedido) {
  return pedido._id || pedido.id || '';
}
