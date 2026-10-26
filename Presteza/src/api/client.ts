/**
 * Cliente HTTP: el ÚNICO archivo de la app que sabe usar `fetch`.
 *
 * Todo lo demás (pantallas, contexto de sesión) llama a funciones con nombre de
 * negocio. Si mañana cambia la forma de hablar con el servidor, se cambia aquí
 * y nada más.
 */

import { API_URL } from './config';
import { logError, logInfo, redactarCuerpo, redactarRespuesta } from './logger';

const TIMEOUT_MS = 15000;

/**
 * Token JWT de la sesión activa.
 *
 * El contexto de sesión lo restaura desde almacenamiento al abrir la app.
 */
let token: string | null = null;

/** La llama el contexto de sesión al entrar (token) y al salir (null). */
export function setToken(value: string | null): void {
  token = value;
}

/** Un solo sitio: si el servidor manda 401 con sesión, se cierra aquí. */
let onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

function cerrarSiTokenRechazado(status: number, path: string, jwtUsado: string | null) {
  if (status !== 401 || !jwtUsado) return;
  if (path.startsWith('/auth/login') || path.startsWith('/auth/register')) return;
  setToken(null);
  onUnauthorized?.();
}

function mensajeError(data: unknown, fallback: string) {
  if (data && typeof data === 'object') {
    const cuerpo = data as { message?: string | string[]; error?: string };
    if (Array.isArray(cuerpo.message)) return cuerpo.message.join('. ');
    if (typeof cuerpo.message === 'string') return cuerpo.message;
    if (typeof cuerpo.error === 'string') return cuerpo.error;
  }
  return fallback;
}

/**
 * Hace una petición a la API y devuelve el JSON ya tipado.
 *
 * - Sin `body` y sin `method` -> GET.
 * - Si hay sesión activa, adjunta `Authorization: Bearer <token>`.
 * - Si el servidor responde con error, conserva el detalle en el log y muestra un mensaje legible.
 *
 * @param path Ruta relativa a la API, empezando por "/". Ej: "/auth/login".
 */
export async function request<T>(
  path: string,
  options?: { method?: string; body?: unknown; token?: string | null }
): Promise<T> {
  const method = options?.method ?? (options?.body === undefined ? 'GET' : 'POST');
  const jwt = options?.token !== undefined ? options.token : token;
  const url = `${API_URL}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
  };

  logInfo('api', `${method} ${url}`, {
    body: redactarCuerpo(
      options?.body && typeof options.body === 'object'
        ? (options.body as Record<string, unknown>)
        : undefined
    ),
    conToken: Boolean(jwt),
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: options?.body === undefined ? undefined : JSON.stringify(options.body),
      signal: controller.signal,
    });
  } catch (error) {
    const abortado = error instanceof Error && error.name === 'AbortError';
    const detalle = abortado
      ? `Tiempo de espera agotado (${TIMEOUT_MS / 1000}s) al conectar con ${API_URL}`
      : `No se pudo conectar con ${API_URL}. ¿Está encendido el servidor?`;

    logError('api', `${method} ${url} FALLÓ`, {
      abortado,
      error: error instanceof Error ? { name: error.name, message: error.message } : error,
    });
    throw new Error(detalle);
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 204) {
    logInfo('api', `${method} ${url} -> 204`);
    return undefined as T;
  }

  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;

  if (!response.ok) {
    const message = mensajeError(data, `Error ${response.status} al llamar ${path}`);
    const esHtml = /<!doctype\s+html\b|<html\b/i.test(message);
    const detalle = esHtml
      ? (
          message.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() || 'Respuesta HTML de error'
        ).slice(0, 200)
      : message;
    logError('api', `${method} ${url} -> ${response.status}`, {
      mensaje: detalle,
      cuerpo: esHtml ? { formato: 'html', longitud: message.length } : redactarRespuesta(data),
    });
    const servicioNoDisponible =
      esHtml ||
      /^(?:(?:TypeError:\s*)?fetch failed|bad gateway|service unavailable|gateway timeout|web server is down)$/i.test(
        message.trim()
      );
    const mensajeUsuario = servicioNoDisponible
      ? 'El servidor no pudo conectarse con uno de sus servicios. Inténtalo de nuevo más tarde.'
      : message;
    cerrarSiTokenRechazado(response.status, path, jwt);
    throw new Error(mensajeUsuario);
  }

  logInfo('api', `${method} ${url} -> ${response.status}`, redactarRespuesta(data));
  return data as T;
}
