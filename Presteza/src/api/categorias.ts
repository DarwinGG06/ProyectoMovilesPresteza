import type { Categoria } from '../types';
import { request } from './client';
import { entidad, lista, texto } from './helpers';

function normalizarCategoria(crudo: Record<string, unknown>): Categoria {
  return {
    _id: texto(crudo._id) || undefined,
    id: texto(crudo.id) || undefined,
    name: texto(crudo.name),
    description: texto(crudo.description),
    imageUrl: texto(crudo.imageUrl) || texto(crudo.image) || texto(crudo.image_url),
    imagePublicId: texto(crudo.imagePublicId) || texto(crudo.image_public_id) || undefined,
    icon: texto(crudo.icon) || undefined,
  };
}

export async function listarCategorias(jwt?: string) {
  const crudos = lista<Record<string, unknown>>(
    await request('/categories', jwt ? { token: jwt } : undefined),
    'categories',
  );
  return crudos.map(normalizarCategoria);
}

// El backend responde `{ message, category: {...} }`: se saca la categoría de
// adentro y se normaliza. Si no, la categoría nueva entra a la lista sin `id`
// y no se puede elegir en el formulario del plato.
export async function crearCategoria(jwt: string, datos: Record<string, unknown>) {
  const respuesta = await request('/categories', { method: 'POST', token: jwt, body: datos });
  return normalizarCategoria(entidad(respuesta, 'category'));
}

export async function actualizarCategoria(jwt: string, id: string, datos: Record<string, unknown>) {
  const respuesta = await request(`/categories/${id}`, { method: 'PATCH', token: jwt, body: datos });
  return normalizarCategoria(entidad(respuesta, 'category'));
}

export function eliminarCategoria(jwt: string, id: string) {
  return request<void>(`/categories/${id}`, { method: 'DELETE', token: jwt });
}
