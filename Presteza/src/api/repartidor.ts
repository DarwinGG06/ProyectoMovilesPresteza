import type { PedidoAdmin } from '@/features/administracion/types';

import { request } from './client';
import { lista, texto } from './helpers';

function normalizarPedido(crudo: Record<string, unknown>): PedidoAdmin {
  return {
    _id: texto(crudo._id) || undefined,
    id: texto(crudo.id) || undefined,
    total: Number(crudo.total) || 0,
    payment_method: texto(crudo.payment_method) || undefined,
    tipo: texto(crudo.tipo) === 'domicilio' ? 'domicilio' : texto(crudo.tipo) === 'mesa' ? 'mesa' : null,
    tableNumber: texto(crudo.tableNumber) || texto(crudo.table_number) || null,
    deliveryAddress: texto(crudo.deliveryAddress) || texto(crudo.delivery_address) || null,
    products: Array.isArray(crudo.products) ? (crudo.products as PedidoAdmin['products']) : [],
    status: texto(crudo.status),
    user_name: texto(crudo.user_name) || texto(crudo.userName),
    userId: texto(crudo.usuarioId) || texto(crudo.userId),
    createdAt: texto(crudo.createdAt),
  };
}

/** Domicilios listos o en camino. */
export async function listarPedidosEntrega(jwt: string) {
  const crudos = lista<Record<string, unknown>>(
    await request('/orders/delivery', { token: jwt }),
    'orders',
  );
  return crudos.map(normalizarPedido);
}

export async function marcarSalirAEntregar(jwt: string, pedidoId: string) {
  return request(`/orders/${pedidoId}/status`, {
    method: 'PATCH',
    token: jwt,
    body: { status: 'en_camino' },
  });
}

export async function publicarUbicacion(
  jwt: string,
  pedidoId: string,
  punto: { lat: number; lng: number },
) {
  return request(`/orders/${pedidoId}/ubicacion`, {
    method: 'PATCH',
    token: jwt,
    body: { lat: punto.lat, lng: punto.lng },
  });
}

export async function marcarEntregado(jwt: string, pedidoId: string) {
  return request(`/orders/${pedidoId}/status`, {
    method: 'PATCH',
    token: jwt,
    body: { status: 'entregado' },
  });
}

/** Semilla: crea la cuenta repartidor (POST /users sin JWT, como el admin seed). */
export async function sembrarRepartidor() {
  return request('/users', {
    method: 'POST',
    body: {
      role: 'repartidor',
      complete_name: 'Repartidor Presteza',
      email: 'repartidor@presteza.com',
      phone_number: '3000000000',
      password: 'Repartidor1234',
      birth_date: '1995-01-15',
    },
  });
}
