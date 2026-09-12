import { API_URL } from './config';
import { logError, logInfo, redactarCuerpo, redactarRespuesta } from './logger';

type Cuerpo = Record<string, unknown>;

const TIMEOUT_MS = 15000;

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
  const method = opciones?.method ?? 'GET';
  const url = `${API_URL}${ruta}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (opciones?.token) {
    headers.Authorization = `Bearer ${opciones.token}`;
  }

  logInfo('api', `${method} ${url}`, {
    body: redactarCuerpo(opciones?.body),
    conToken: Boolean(opciones?.token),
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let respuesta: Response;
  try {
    respuesta = await fetch(url, {
      method,
      headers,
      body: opciones?.body ? JSON.stringify(opciones.body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    const abortado = error instanceof Error && error.name === 'AbortError';
    const detalle = abortado
      ? `Tiempo de espera agotado (${TIMEOUT_MS / 1000}s) al conectar con ${API_URL}`
      : `No se pudo conectar con el servidor (${API_URL}). ¿Está corriendo el backend?`;

    logError('api', `${method} ${url} FALLÓ`, {
      abortado,
      error: error instanceof Error ? { name: error.name, message: error.message } : error,
    });
    throw new Error(detalle);
  } finally {
    clearTimeout(timeout);
  }

  if (respuesta.status === 204) {
    logInfo('api', `${method} ${url} -> 204`);
    return undefined as T;
  }

  const data = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    const mensaje = mensajeError(data, `Error ${respuesta.status}`);
    logError('api', `${method} ${url} -> ${respuesta.status}`, {
      mensaje,
      cuerpo: redactarRespuesta(data),
    });
    throw new Error(mensaje);
  }

  logInfo('api', `${method} ${url} -> ${respuesta.status}`, redactarRespuesta(data));
  return data as T;
}
