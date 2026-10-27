import type { Producto } from '../types';
import { request } from './client';
import { entidad, idDe, lista, texto } from './helpers';

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
    description:
      texto(crudo.description) ||
      texto(crudo.descripcion) ||
      texto(crudo.desc) ||
      texto(crudo.details),
    price: Number(crudo.price) || 0,
    categoryId,
    category:
      categoria && typeof categoria === 'object'
        ? texto((categoria as { name?: unknown }).name)
        : texto(categoria) || undefined,
    imageUrl: texto(crudo.imageUrl) || texto(crudo.image),
    modelUrl: texto(crudo.modelUrl) || texto(crudo.model_url) || undefined,
    type: texto(crudo.type) || 'principal',
    available: crudo.available !== false,
  };
}

export async function listarProductos(jwt?: string) {
  const crudos = lista<Record<string, unknown>>(
    await request('/dishes', jwt ? { token: jwt } : undefined),
    'dishes',
    'products',
  );
  return crudos.map(normalizarProducto);
}

export async function crearProducto(jwt: string, datos: Record<string, unknown>) {
  const respuesta = await request('/dishes', { method: 'POST', token: jwt, body: datos });
  return normalizarProducto(entidad(respuesta, 'dish', 'product'));
}

export async function actualizarProducto(jwt: string, id: string, datos: Record<string, unknown>) {
  const limpio = id.trim();
  if (!limpio) throw new Error('Este plato no tiene id. Cierra el formulario y ábrelo otra vez.');
  const respuesta = await request(`/dishes/${limpio}`, { method: 'PATCH', token: jwt, body: datos });
  return normalizarProducto(entidad(respuesta, 'dish', 'product'));
}

export function eliminarProducto(jwt: string, id: string) {
  const limpio = id.trim();
  if (!limpio) return Promise.reject(new Error('Este plato no tiene id. Recarga la lista.'));
  return request<void>(`/dishes/${limpio}`, { method: 'DELETE', token: jwt });
}
