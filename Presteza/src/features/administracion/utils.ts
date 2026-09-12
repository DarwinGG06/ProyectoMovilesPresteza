import type { PedidoAdmin, StatsAdmin } from './types';

export function idDe(item?: { _id?: string; id?: string }) {
  return item?._id || item?.id || '';
}

export function formatoFechaHora(valor?: string) {
  if (!valor) return '—';
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return valor;
  return fecha.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function textoEstadoPedido(status: string) {
  const mapa: Record<string, string> = {
    pending: 'Pendiente',
    pendiente: 'Pendiente',
    preparing: 'Preparando',
    en_proceso: 'Preparando',
    Preparando: 'Preparando',
    ready: 'Listo',
    listo: 'Listo',
    completado: 'Listo',
    delivered: 'Entregado',
    entregado: 'Entregado',
    cancelled: 'Cancelado',
    cancelado: 'Cancelado',
  };
  return mapa[status] ?? status;
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

export function estadoPedidoBackend(status: string) {
  const mapa: Record<string, string> = {
    pending: 'pendiente',
    pendiente: 'pendiente',
    preparing: 'Preparando',
    en_proceso: 'Preparando',
    Preparando: 'Preparando',
    ready: 'listo',
    listo: 'listo',
    completado: 'listo',
    delivered: 'entregado',
    entregado: 'entregado',
    cancelled: 'cancelado',
    cancelado: 'cancelado',
  };
  return mapa[status] ?? status;
}

export function esPendientePedido(status: string) {
  return ['pending', 'pendiente', 'preparing', 'en_proceso', 'Preparando'].includes(status);
}

export function esPendienteReserva(status: string) {
  return status === 'pending';
}

export function calcularStats(datos: {
  pedidos: PedidoAdmin[];
  productos: { available?: boolean }[];
  reservas: { status: string }[];
  mensajes: { read?: boolean }[];
  clientes: unknown[];
  categorias: unknown[];
  insumos: unknown[];
  adicionales: unknown[];
}): StatsAdmin {
  const { pedidos, productos, reservas, mensajes, clientes, categorias, insumos, adicionales } = datos;
  const activos = pedidos.filter((pedido) => pedido.status !== 'cancelled' && pedido.status !== 'cancelado');

  return {
    totalOrders: pedidos.length,
    pendingOrders: pedidos.filter((pedido) => esPendientePedido(pedido.status)).length,
    totalRevenue: activos.reduce((suma, pedido) => suma + (Number(pedido.total) || 0), 0),
    totalProducts: productos.filter((producto) => producto.available !== false).length,
    totalReservations: reservas.length,
    pendingReservations: reservas.filter((reserva) => esPendienteReserva(reserva.status)).length,
    totalMessages: mensajes.length,
    unreadMessages: mensajes.filter((mensaje) => !mensaje.read).length,
    totalCustomers: clientes.length,
    totalCategorias: categorias.length,
    totalInsumos: insumos.length,
    totalAdicionales: adicionales.length,
  };
}

export function iniciales(nombre?: string) {
  if (!nombre) return 'C';
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? '')
    .join('');
}
