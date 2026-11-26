import { request } from './client';
import { lista, texto } from './helpers';

export type PapeleraKind = 'pedido' | 'reserva' | 'mensaje';

export type ItemPapelera = {
  kind: PapeleraKind;
  id: string;
  title: string;
  subtitle: string;
  deletedAt?: string | null;
  ownerId?: string | null;
};

function normalizar(crudo: Record<string, unknown>): ItemPapelera {
  const kind = texto(crudo.kind);
  return {
    kind:
      kind === 'reserva' || kind === 'mensaje' || kind === 'pedido'
        ? kind
        : 'pedido',
    id: texto(crudo.id),
    title: texto(crudo.title) || 'Elemento',
    subtitle: texto(crudo.subtitle),
    deletedAt: texto(crudo.deletedAt) || null,
    ownerId: texto(crudo.ownerId) || null,
  };
}

export async function listarPapelera(jwt: string) {
  const data = await request('/trash', { token: jwt });
  return lista<Record<string, unknown>>(data, 'items').map(normalizar);
}

export async function restaurarPapelera(jwt: string, kind: PapeleraKind, id: string) {
  return request(`/trash/${kind}/${id}/restore`, {
    method: 'PATCH',
    token: jwt,
  });
}

export async function vaciarPapelera(jwt: string, kind: PapeleraKind, id: string) {
  return request(`/trash/${kind}/${id}`, {
    method: 'DELETE',
    token: jwt,
  });
}
