import { router, type Href } from 'expo-router';

import type { PestanaAdmin } from './types';

export const PESTANA_POR_RUTA: Record<string, PestanaAdmin> = {
  index: 'dashboard',
  productos: 'productos',
  pedidos: 'pedidos',
  categorias: 'categorias',
  inventario: 'inventario',
  reservas: 'reservas',
  adicionales: 'adicionales',
  mensajes: 'mensajes',
  clientes: 'clientes',
  papelera: 'papelera',
  ajustes: 'ajustes',
};

export const RUTA_POR_PESTANA: Record<PestanaAdmin, string> = {
  dashboard: 'index',
  productos: 'productos',
  pedidos: 'pedidos',
  categorias: 'categorias',
  inventario: 'inventario',
  reservas: 'reservas',
  adicionales: 'adicionales',
  mensajes: 'mensajes',
  clientes: 'clientes',
  papelera: 'papelera',
  ajustes: 'ajustes',
};

export function hrefAdmin(pestana: PestanaAdmin): Href {
  return (pestana === 'dashboard' ? '/home/admin' : `/home/admin/${pestana}`) as Href;
}

export function irAlPanelAdmin() {
  router.navigate('/home/admin' as Href);
}
