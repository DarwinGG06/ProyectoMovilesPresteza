import type { Producto } from '../types';
import { request } from './client';
import { idDe, lista, seguro, texto } from './helpers';

function normalizarProducto(crudo: Record<string, unknown>): Producto {
  const categoria = crudo.category;
  const categoryId =
    texto(crudo.categoryId) ||
    texto(crudo.category_id) ||
    (categoria && typeof categoria === 'object'
      ? idDe(categoria as { _id?: string; id?: string })
      : texto(categoria));

  return {
    _id: texto(crudo._id) || undefined,
    id: texto(crudo.id) || undefined,
    name: texto(crudo.name),
    description: texto(crudo.description),
    price: Number(crudo.price) || 0,
    categoryId,
    category:
      categoria && typeof categoria === 'object'
        ? texto((categoria as { name?: unknown }).name)
        : texto(categoria) || undefined,
    imageUrl: texto(crudo.imageUrl) || texto(crudo.image),
    type: texto(crudo.type) || 'principal',
    available: crudo.available !== false,
  };
}

export function listarProductos(jwt?: string) {
  return seguro(async () => {
    const crudos = lista<Record<string, unknown>>(
      await request('/dishes', jwt ? { token: jwt } : undefined),
      'dishes',
      'products',
    );
    return crudos.map(normalizarProducto);
  }, []);
}

export function crearProducto(jwt: string, datos: Record<string, unknown>) {
  return request<Producto>('/dishes', { method: 'POST', token: jwt, body: datos });
}

export function actualizarProducto(jwt: string, id: string, datos: Record<string, unknown>) {
  return request<Producto>(`/dishes/${id}`, { method: 'PATCH', token: jwt, body: datos });
}

export function eliminarProducto(jwt: string, id: string) {
  return request<void>(`/dishes/${id}`, { method: 'DELETE', token: jwt });
}
