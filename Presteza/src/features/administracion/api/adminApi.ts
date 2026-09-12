import { pedirApi } from '@/services/api/cliente';

import type {
  AdicionalAdmin,
  CategoriaAdmin,
  ClienteAdmin,
  InsumoAdmin,
  MensajeAdmin,
  MesaAdmin,
  PedidoAdmin,
  ProductoAdmin,
  ReservaAdmin,
} from '../types';
import { estadoPedidoBackend, idDe } from '../utils';

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

function normalizarProducto(crudo: Record<string, unknown>): ProductoAdmin {
  const categoria = crudo.category;
  const categoryId =
    texto(crudo.categoryId) ||
    texto(crudo.category_id) ||
    (categoria && typeof categoria === 'object' ? idDe(categoria as { _id?: string; id?: string }) : texto(categoria));

  return {
    _id: texto(crudo._id) || undefined,
    id: texto(crudo.id) || undefined,
    name: texto(crudo.name),
    description: texto(crudo.description),
    price: Number(crudo.price) || 0,
    categoryId,
    imageUrl: texto(crudo.imageUrl) || texto(crudo.image),
    available: crudo.available !== false,
  };
}

function normalizarCategoria(crudo: Record<string, unknown>): CategoriaAdmin {
  return {
    _id: texto(crudo._id) || undefined,
    id: texto(crudo.id) || undefined,
    name: texto(crudo.name),
    description: texto(crudo.description),
    imageUrl: texto(crudo.imageUrl) || texto(crudo.image),
    icon: texto(crudo.icon) || undefined,
  };
}

async function seguro<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
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

function normalizarPedido(crudo: Record<string, unknown>): PedidoAdmin {
  return {
    _id: texto(crudo._id) || undefined,
    id: texto(crudo.id) || undefined,
    total: Number(crudo.total) || 0,
    payment_method: texto(crudo.payment_method) || undefined,
    products: Array.isArray(crudo.products) ? (crudo.products as PedidoAdmin['products']) : [],
    status: texto(crudo.status),
    user_name: texto(crudo.user_name) || texto(crudo.userName),
    userId: texto(crudo.usuarioId) || texto(crudo.userId),
    createdAt: texto(crudo.createdAt),
  };
}

function normalizarReserva(crudo: Record<string, unknown>): ReservaAdmin {
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

function normalizarMensaje(crudo: Record<string, unknown>): MensajeAdmin {
  return {
    _id: texto(crudo._id) || undefined,
    id: texto(crudo.id) || undefined,
    name: texto(crudo.name) || texto(crudo.user_name),
    email: texto(crudo.email) || texto(crudo.user_email),
    phone: texto(crudo.phone) || texto(crudo.user_phone) || undefined,
    subject: texto(crudo.subject) || texto(crudo.user_title),
    message: texto(crudo.message) || texto(crudo.user_comment),
    createdAt: texto(crudo.createdAt),
  };
}

export function listarPedidos(token: string) {
  return seguro(async () => {
    const crudos = lista<Record<string, unknown>>(await pedirApi('/orders', { token }), 'orders');
    return crudos.map(normalizarPedido);
  }, []);
}

export function actualizarEstadoPedido(token: string, pedidoId: string, status: string) {
  return pedirApi<PedidoAdmin>(`/orders/${pedidoId}`, {
    method: 'PATCH',
    token,
    body: { status: estadoPedidoBackend(status) },
  });
}

export async function crearPedido(token: string, datos: Record<string, unknown>) {
  const respuesta = await pedirApi(`/orders`, { method: 'POST', token, body: datos });
  return normalizarPedido(entidad(respuesta, 'order'));
}

export async function actualizarPedido(token: string, id: string, datos: Record<string, unknown>) {
  const respuesta = await pedirApi(`/orders/${id}`, { method: 'PATCH', token, body: datos });
  return normalizarPedido(entidad(respuesta, 'order'));
}

export function eliminarPedido(token: string, id: string) {
  return pedirApi<void>(`/orders/${id}`, { method: 'DELETE', token });
}

export function listarReservas(token: string) {
  return seguro(async () => {
    const crudos = lista<Record<string, unknown>>(
      await pedirApi('/reservations', { token }),
      'reservations',
    );
    return crudos.map(normalizarReserva);
  }, []);
}

export async function crearReserva(token: string, datos: Record<string, unknown>) {
  const respuesta = await pedirApi(`/reservations`, { method: 'POST', token, body: datos });
  return normalizarReserva(entidad(respuesta, 'reservation'));
}

export async function actualizarReserva(token: string, id: string, datos: Record<string, unknown>) {
  const respuesta = await pedirApi(`/reservations/${id}`, { method: 'PATCH', token, body: datos });
  return normalizarReserva(entidad(respuesta, 'reservation'));
}

export function actualizarEstadoReserva(token: string, reservaId: string, status: string) {
  return pedirApi<ReservaAdmin>(`/reservations/${reservaId}/status`, {
    method: 'PATCH',
    token,
    body: { status },
  });
}

export function eliminarReserva(token: string, id: string) {
  return pedirApi<void>(`/reservations/${id}`, { method: 'DELETE', token });
}

export function listarMesas() {
  return seguro(async () => {
    const crudos = lista<Record<string, unknown>>(await pedirApi('/tables'), 'tables');
    return crudos.map((mesa) => ({
      _id: texto(mesa._id) || undefined,
      id: texto(mesa.id) || undefined,
      number: texto(mesa.number),
      capacity: Number(mesa.capacity) || 0,
      active: mesa.active !== false,
      status: texto(mesa.status) || undefined,
    })) as MesaAdmin[];
  }, []);
}

export function listarProductos(token: string) {
  return seguro(async () => {
    const crudos = lista<Record<string, unknown>>(await pedirApi('/dishes', { token }), 'dishes', 'products');
    return crudos.map(normalizarProducto);
  }, []);
}

export function crearProducto(token: string, datos: Record<string, unknown>) {
  return pedirApi<ProductoAdmin>('/dishes', { method: 'POST', token, body: datos });
}

export function actualizarProducto(token: string, id: string, datos: Record<string, unknown>) {
  return pedirApi<ProductoAdmin>(`/dishes/${id}`, { method: 'PATCH', token, body: datos });
}

export function eliminarProducto(token: string, id: string) {
  return pedirApi<void>(`/dishes/${id}`, { method: 'DELETE', token });
}

export function listarCategorias(token: string) {
  return seguro(async () => {
    const crudos = lista<Record<string, unknown>>(await pedirApi('/categories', { token }), 'categories');
    return crudos.map(normalizarCategoria);
  }, []);
}

export function crearCategoria(token: string, datos: Record<string, unknown>) {
  return pedirApi<CategoriaAdmin>('/categories', { method: 'POST', token, body: datos });
}

export function actualizarCategoria(token: string, id: string, datos: Record<string, unknown>) {
  return pedirApi<CategoriaAdmin>(`/categories/${id}`, { method: 'PATCH', token, body: datos });
}

export function eliminarCategoria(token: string, id: string) {
  return pedirApi<void>(`/categories/${id}`, { method: 'DELETE', token });
}

export function listarInsumos(token: string) {
  return seguro(async () => {
    const crudos = lista<Record<string, unknown>>(await pedirApi('/supplies', { token }), 'supplies');
    return crudos.map((item) => ({
      _id: texto(item._id) || undefined,
      id: texto(item.id) || undefined,
      name: texto(item.name),
      description: texto(item.description),
      unit_price: Number(item.unit_price) || 0,
      quantity: Number(item.quantity) || 0,
    })) as InsumoAdmin[];
  }, [] as InsumoAdmin[]);
}

export function crearInsumo(token: string, datos: Record<string, unknown>) {
  return pedirApi<InsumoAdmin>('/supplies', { method: 'POST', token, body: datos });
}

export function actualizarInsumo(token: string, id: string, datos: Record<string, unknown>) {
  return pedirApi<InsumoAdmin>(`/supplies/${id}`, { method: 'PATCH', token, body: datos });
}

export function eliminarInsumo(token: string, id: string) {
  return pedirApi<void>(`/supplies/${id}`, { method: 'DELETE', token });
}

export function listarAdicionales(token: string) {
  return seguro(async () => {
    const crudos = lista<Record<string, unknown>>(await pedirApi('/adds', { token }), 'adds');
    return crudos.map((item) => ({
      _id: texto(item._id) || undefined,
      id: texto(item.id) || undefined,
      name: texto(item.name),
      description: texto(item.description) || undefined,
      price: Number(item.price) || 0,
      available: item.available !== false,
      categoryIds: Array.isArray(item.categoryIds) ? (item.categoryIds as string[]) : undefined,
      dishIds: Array.isArray(item.dishIds) ? (item.dishIds as string[]) : undefined,
    })) as AdicionalAdmin[];
  }, [] as AdicionalAdmin[]);
}

export function crearAdicional(token: string, datos: Record<string, unknown>) {
  return pedirApi<AdicionalAdmin>('/adds', { method: 'POST', token, body: datos });
}

export function actualizarAdicional(token: string, id: string, datos: Record<string, unknown>) {
  return pedirApi<AdicionalAdmin>(`/adds/${id}`, { method: 'PATCH', token, body: datos });
}

export function eliminarAdicional(token: string, id: string) {
  return pedirApi<void>(`/adds/${id}`, { method: 'DELETE', token });
}

export function listarMensajes(token: string) {
  return seguro(async () => {
    const crudos = lista<Record<string, unknown>>(
      await pedirApi('/comments', { token }),
      'comments',
      'messages',
    );
    return crudos.map(normalizarMensaje);
  }, []);
}

export async function crearMensaje(token: string, datos: Record<string, unknown>) {
  const respuesta = await pedirApi('/comments', { method: 'POST', token, body: datos });
  return normalizarMensaje(entidad(respuesta, 'comment'));
}

export async function actualizarMensaje(token: string, id: string, datos: Record<string, unknown>) {
  const respuesta = await pedirApi(`/comments/${id}`, { method: 'PATCH', token, body: datos });
  return normalizarMensaje(entidad(respuesta, 'comment'));
}

export function eliminarMensaje(token: string, id: string) {
  return pedirApi<void>(`/comments/${id}`, { method: 'DELETE', token });
}

export function listarUsuarios(token: string) {
  return seguro(async () => {
    const data = await pedirApi<
      { id?: string; _id?: string; complete_name?: string; name?: string; email?: string; phone_number?: string; role?: string }[]
      | { users?: { id?: string; _id?: string; complete_name?: string; name?: string; email?: string; phone_number?: string; role?: string }[] }
    >('/users', { token });
    const crudos = lista<Record<string, unknown>>(data, 'users');
    return crudos.map((usuario) => ({
      id: idDe({ id: texto(usuario.id), _id: texto(usuario._id) }),
      name: texto(usuario.complete_name) || texto(usuario.name),
      email: texto(usuario.email) || undefined,
      phone: texto(usuario.phone_number) || undefined,
      role: texto(usuario.role) || undefined,
    })) as ClienteAdmin[];
  }, [] as ClienteAdmin[]);
}

export async function crearCliente(datos: { name: string; email: string; phone: string; password: string }) {
  const respuesta = await pedirApi<{ message?: string; userId?: string; user?: { id?: string; _id?: string } }>(
    '/auth/register',
    {
      method: 'POST',
      body: {
        complete_name: datos.name,
        email: datos.email,
        phone_number: datos.phone,
        password: datos.password,
        role: 'client',
      },
    },
  );

  return {
    id: respuesta.userId || idDe(respuesta.user) || datos.email,
    name: datos.name,
    email: datos.email,
    phone: datos.phone,
    role: 'client',
  };
}

export function eliminarCliente(token: string, id: string) {
  return pedirApi<void>(`/users/${id}`, { method: 'DELETE', token });
}
