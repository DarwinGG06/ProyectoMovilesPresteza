import type { AdicionalAdmin, InsumoAdmin, MensajeAdmin, PedidoAdmin } from '@/features/administracion/types';
import { estadoPedidoBackend } from '@/features/administracion/utils';

import { request } from './client';
import { entidad, lista, seguro, texto } from './helpers';

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

export function listarPedidos(jwt: string) {
  return seguro(async () => {
    const crudos = lista<Record<string, unknown>>(await request('/orders', { token: jwt }), 'orders');
    return crudos.map(normalizarPedido);
  }, []);
}

export function actualizarEstadoPedido(jwt: string, pedidoId: string, status: string) {
  return request<PedidoAdmin>(`/orders/${pedidoId}`, {
    method: 'PATCH',
    token: jwt,
    body: { status: estadoPedidoBackend(status) },
  });
}

export async function crearPedido(jwt: string, datos: Record<string, unknown>) {
  const respuesta = await request(`/orders`, { method: 'POST', token: jwt, body: datos });
  return normalizarPedido(entidad(respuesta, 'order'));
}

export async function actualizarPedido(jwt: string, id: string, datos: Record<string, unknown>) {
  const respuesta = await request(`/orders/${id}`, { method: 'PATCH', token: jwt, body: datos });
  return normalizarPedido(entidad(respuesta, 'order'));
}

export function eliminarPedido(jwt: string, id: string) {
  return request<void>(`/orders/${id}`, { method: 'DELETE', token: jwt });
}

export function listarInsumos(jwt: string) {
  return seguro(async () => {
    const crudos = lista<Record<string, unknown>>(await request('/supplies', { token: jwt }), 'supplies');
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

export function crearInsumo(jwt: string, datos: Record<string, unknown>) {
  return request<InsumoAdmin>('/supplies', { method: 'POST', token: jwt, body: datos });
}

export function actualizarInsumo(jwt: string, id: string, datos: Record<string, unknown>) {
  return request<InsumoAdmin>(`/supplies/${id}`, { method: 'PATCH', token: jwt, body: datos });
}

export function eliminarInsumo(jwt: string, id: string) {
  return request<void>(`/supplies/${id}`, { method: 'DELETE', token: jwt });
}

export function listarAdicionales(jwt: string) {
  return seguro(async () => {
    const crudos = lista<Record<string, unknown>>(await request('/adds', { token: jwt }), 'adds');
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

export function crearAdicional(jwt: string, datos: Record<string, unknown>) {
  return request<AdicionalAdmin>('/adds', { method: 'POST', token: jwt, body: datos });
}

export function actualizarAdicional(jwt: string, id: string, datos: Record<string, unknown>) {
  return request<AdicionalAdmin>(`/adds/${id}`, { method: 'PATCH', token: jwt, body: datos });
}

export function eliminarAdicional(jwt: string, id: string) {
  return request<void>(`/adds/${id}`, { method: 'DELETE', token: jwt });
}

export function listarMensajes(jwt: string) {
  return seguro(async () => {
    const crudos = lista<Record<string, unknown>>(
      await request('/comments', { token: jwt }),
      'comments',
      'messages',
    );
    return crudos.map(normalizarMensaje);
  }, []);
}

export async function crearMensaje(jwt: string, datos: Record<string, unknown>) {
  const respuesta = await request('/comments', { method: 'POST', token: jwt, body: datos });
  return normalizarMensaje(entidad(respuesta, 'comment'));
}

export async function actualizarMensaje(jwt: string, id: string, datos: Record<string, unknown>) {
  const respuesta = await request(`/comments/${id}`, { method: 'PATCH', token: jwt, body: datos });
  return normalizarMensaje(entidad(respuesta, 'comment'));
}

export function eliminarMensaje(jwt: string, id: string) {
  return request<void>(`/comments/${id}`, { method: 'DELETE', token: jwt });
}
