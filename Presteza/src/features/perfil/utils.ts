import type { Pedido } from './types';

export function iniciales(nombre: string) {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? '')
    .join('');
}

export function primerNombre(nombre: string) {
  return nombre.trim().split(/\s+/).filter(Boolean)[0] || nombre;
}

export function formatFecha(valor?: string) {
  if (!valor) return '—';
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return valor;
  return fecha.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function textoEstadoPedido(status: string) {
  const mapa: Record<string, string> = {
    pending: 'Pendiente',
    pendiente: 'Pendiente',
    preparing: 'Preparando',
    en_proceso: 'Preparando',
    ready: 'Listo',
    completado: 'Listo',
    delivered: 'Entregado',
    entregado: 'Entregado',
    cancelled: 'Cancelado',
    cancelado: 'Cancelado',
  };
  return mapa[status] ?? status;
}

export function indiceEstadoPedido(status: string) {
  const orden = ['pending', 'pendiente', 'preparing', 'en_proceso', 'ready', 'completado', 'delivered', 'entregado'];
  if (status === 'cancelled' || status === 'cancelado') return -1;
  if (status === 'pending' || status === 'pendiente') return 0;
  if (status === 'preparing' || status === 'en_proceso') return 1;
  if (status === 'ready' || status === 'completado') return 2;
  if (status === 'delivered' || status === 'entregado') return 3;
  return Math.max(orden.indexOf(status), 0);
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

export function metodoPagoNombre(metodo: string) {
  const mapa: Record<string, string> = {
    card: 'Tarjeta',
    cash: 'Efectivo',
    nequi: 'Nequi',
    daviplata: 'Daviplata',
    transfer: 'Transferencia',
  };
  return mapa[metodo] ?? metodo;
}

export function totalItemsPedido(pedido: Pedido) {
  return pedido.products?.reduce((suma, item) => suma + (item.quantity || 0), 0) ?? 0;
}
