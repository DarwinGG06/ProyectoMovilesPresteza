import type { ComponentProps } from 'react';

import { IconoNav } from '@/shared/components/nav-bar/IconoNav';

type NombreIcono = ComponentProps<typeof IconoNav>['name'];

export function iconoDeKind(kind?: string): NombreIcono {
  const clave = String(kind || '').toLowerCase();
  if (clave.includes('reserva')) return 'calendar-outline';
  if (clave.includes('camino') || clave.includes('reparto')) return 'bicycle-outline';
  if (clave.includes('domicilio') || clave.includes('listo')) return 'restaurant-outline';
  if (clave.includes('entregado') || clave.includes('completada') || clave.includes('confirmada')) {
    return 'checkmark-circle-outline';
  }
  if (clave.includes('cancel')) return 'close-circle-outline';
  if (clave.includes('preparando')) return 'flame-outline';
  if (clave.includes('nuevo') || clave.includes('creado') || clave.includes('creada')) {
    return 'star-outline';
  }
  return 'notifications-outline';
}

export function selloDeKind(kind?: string) {
  const clave = String(kind || '').toLowerCase();
  if (clave.includes('reserva')) return 'MESA';
  if (clave.includes('camino') || clave.includes('domicilio') || clave.includes('reparto')) {
    return 'REPARTO';
  }
  if (clave.includes('pedido') || clave.includes('listo') || clave.includes('entregado')) {
    return 'PEDIDO';
  }
  return 'AVISO';
}

export function formatoHoraAviso(valor?: string) {
  if (!valor) return '';
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return '';
  return fecha.toLocaleString('es-CO', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
