import { Platform } from 'react-native';

import { request } from '@/api/client';

import type { ArchivoImagen } from './formatos';
import { extraerPublicId, type RecursoNube } from './nube';

/**
 * Subida FIRMADA a Cloudinary.
 *
 * 1. La app le pide una firma al backend (`POST /cloudinary/firma`, solo admin).
 *    El backend firma con el api_secret, que nunca sale del servidor.
 * 2. La app sube el archivo directo a Cloudinary con esa firma.
 * 3. Se guarda en la BD solo `url` + `public_id`.
 *
 * No se usa un upload preset "unsigned": con uno de esos, cualquiera que lea
 * el bundle de la app podría subir archivos a la cuenta.
 */

const TIMEOUT_MS = 60000;
const MENSAJE_TIMEOUT = 'La subida tardó demasiado. Intenta con un archivo más liviano.';

/** Lo mínimo que necesita Cloudinary para recibir un archivo. */
export type ArchivoSubida = {
  uri: string;
  mime: string;
  nombre: string;
};

/**
 * Tipo de recurso de Cloudinary:
 * - `image`: fotos (Cloudinary puede transformarlas).
 * - `raw`: cualquier otro archivo, se guarda tal cual (p. ej. modelos 3D .glb).
 */
export type TipoRecurso = 'image' | 'raw';

/** Carpeta de la foto en Cloudinary: `presteza/platos` o `presteza/categorias`. */
export type DestinoSubida = 'platos' | 'categorias';

/** Lo que devuelve el backend en `POST /cloudinary/firma`. */
type FirmaSubida = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
};

function mensajeCloudinary(crudo?: string) {
  const texto = (crudo ?? '').toLowerCase();

  if (texto.includes('invalid signature') || texto.includes('stale request')) {
    return 'La firma de subida no es válida o venció. Intenta otra vez.';
  }

  if (texto.includes('unknown api key')) {
    return 'Cloudinary no reconoce la API key configurada en el servidor.';
  }

  if (texto.includes('file size too large')) {
    return 'El archivo supera el tamaño máximo que permite Cloudinary.';
  }

  return crudo?.trim() || 'No se pudo subir el archivo.';
}

type RespuestaCloudinary = {
  secure_url?: string;
  public_id?: string;
  error?: { message?: string };
};

type Respuesta = { ok: boolean; cuerpo: RespuestaCloudinary };

/** Campos firmados que acompañan al archivo. */
function camposFirmados(form: FormData, firma: FirmaSubida) {
  form.append('api_key', firma.apiKey);
  form.append('timestamp', String(firma.timestamp));
  form.append('folder', firma.folder);
  form.append('signature', firma.signature);
}

/** Web: `fetch` normal con el archivo como Blob. */
async function enviarWeb(url: string, archivo: ArchivoSubida, firma: FirmaSubida): Promise<Respuesta> {
  const form = new FormData();
  camposFirmados(form, firma);
  const blob = await (await fetch(archivo.uri)).blob();
  form.append('file', blob, archivo.nombre);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const respuesta = await fetch(url, { method: 'POST', body: form, signal: controller.signal });
    return { ok: respuesta.ok, cuerpo: (await respuesta.json()) as RespuestaCloudinary };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw new Error(MENSAJE_TIMEOUT);
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Celular: `XMLHttpRequest` de React Native con el archivo como `{ uri, name, type }`.
 *
 * - No se usa `fetch`: en este SDK es el de Expo (`expo/fetch`), que no acepta
 *   esa forma ("Unsupported FormDataPart implementation").
 * - No se usa `File` de expo-file-system: en Expo Go no puede leer la copia que
 *   deja DocumentPicker ("Missing 'READ' permission").
 * El módulo de red de React Native lee el archivo directo desde la `uri`.
 */
function enviarNativo(url: string, archivo: ArchivoSubida, firma: FirmaSubida): Promise<Respuesta> {
  const form = new FormData();
  camposFirmados(form, firma);
  form.append('file', {
    uri: archivo.uri,
    name: archivo.nombre,
    type: archivo.mime,
  } as unknown as Blob);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.timeout = TIMEOUT_MS;
    xhr.onload = () => {
      let cuerpo: RespuestaCloudinary = {};
      try {
        cuerpo = JSON.parse(xhr.responseText) as RespuestaCloudinary;
      } catch {
        // Respuesta que no es JSON: se trata como error abajo.
      }
      resolve({ ok: xhr.status >= 200 && xhr.status < 300, cuerpo });
    };
    xhr.onerror = () => reject(new Error('No hay conexión con Cloudinary.'));
    xhr.ontimeout = () => reject(new Error(MENSAJE_TIMEOUT));
    xhr.send(form);
  });
}

/** Pide la firma al backend. Usa el token de la sesión activa (solo admin). */
function pedirFirma(tipo: TipoRecurso, destino: DestinoSubida) {
  return request<FirmaSubida>('/cloudinary/firma', { method: 'POST', body: { tipo, destino } });
}

export async function subirACloudinary(
  archivo: ArchivoSubida,
  tipo: TipoRecurso = 'image',
  destino: DestinoSubida = 'platos',
): Promise<RecursoNube> {
  const firma = await pedirFirma(tipo, destino);
  const url = `https://api.cloudinary.com/v1_1/${firma.cloudName}/${tipo}/upload`;
  const { ok, cuerpo } =
    Platform.OS === 'web'
      ? await enviarWeb(url, archivo, firma)
      : await enviarNativo(url, archivo, firma);

  if (!ok || !cuerpo.secure_url) {
    throw new Error(mensajeCloudinary(cuerpo.error?.message));
  }

  return {
    url: cuerpo.secure_url,
    publicId: cuerpo.public_id || extraerPublicId(cuerpo.secure_url),
  };
}

/** Sube una foto. `destino` elige la carpeta en Cloudinary (platos o categorías). */
export function subirImagenACloudinary(
  archivo: ArchivoImagen,
  destino: DestinoSubida = 'platos',
): Promise<RecursoNube> {
  return subirACloudinary(archivo, 'image', destino);
}
