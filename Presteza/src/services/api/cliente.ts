import { API_URL } from './config';

type Cuerpo = Record<string, unknown>;

function mensajeError(data: unknown, fallback: string) {
  if (data && typeof data === 'object') {
    const cuerpo = data as { message?: string | string[] };
    if (Array.isArray(cuerpo.message)) return cuerpo.message.join('. ');
    if (typeof cuerpo.message === 'string') return cuerpo.message;
  }
  return fallback;
}

export async function pedirApi<T>(
  ruta: string,
  opciones?: { method?: string; body?: Cuerpo; token?: string | null },
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (opciones?.token) {
    headers.Authorization = `Bearer ${opciones.token}`;
  }

  let respuesta: Response;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      method: opciones?.method ?? 'GET',
      headers,
      body: opciones?.body ? JSON.stringify(opciones.body) : undefined,
    });
  } catch {
    throw new Error(`No se pudo conectar con el servidor (${API_URL}). ¿Está corriendo el backend?`);
  }

  if (respuesta.status === 204) {
    return undefined as T;
  }

  const data = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    throw new Error(mensajeError(data, `Error ${respuesta.status}`));
  }

  return data as T;
}
