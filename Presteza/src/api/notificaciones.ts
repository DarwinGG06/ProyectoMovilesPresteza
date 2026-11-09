import { request } from './client';
import { lista, texto } from './helpers';

export type Notificacion = {
  id: string;
  kind: string;
  title: string;
  body: string;
  href?: string | null;
  refType?: string | null;
  refId?: string | null;
  readAt?: string | null;
  createdAt?: string;
};

function normalizar(crudo: Record<string, unknown>): Notificacion {
  return {
    id: texto(crudo.id),
    kind: texto(crudo.kind),
    title: texto(crudo.title),
    body: texto(crudo.body),
    href: texto(crudo.href) || null,
    refType: texto(crudo.refType) || texto(crudo.ref_type) || null,
    refId: texto(crudo.refId) || texto(crudo.ref_id) || null,
    readAt: texto(crudo.readAt) || texto(crudo.read_at) || null,
    createdAt: texto(crudo.createdAt) || texto(crudo.created_at) || undefined,
  };
}

export async function listarNotificaciones(jwt: string) {
  const data = await request<Record<string, unknown>>('/notifications', {
    token: jwt,
  });
  const items = lista<Record<string, unknown>>(data, 'notifications').map(normalizar);
  const unread =
    typeof data.unread === 'number'
      ? data.unread
      : items.filter((item) => !item.readAt).length;
  return { items, unread };
}

export async function marcarNotificacionLeida(jwt: string, id: string) {
  return request(`/notifications/${id}/read`, {
    method: 'PATCH',
    token: jwt,
  });
}

export async function marcarTodasNotificacionesLeidas(jwt: string) {
  return request('/notifications/read-all', {
    method: 'PATCH',
    token: jwt,
  });
}

export async function registrarPushToken(jwt: string, token: string) {
  return request('/notifications/push-token', {
    method: 'PATCH',
    token: jwt,
    body: { token },
  });
}
