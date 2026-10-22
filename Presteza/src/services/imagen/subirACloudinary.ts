import { Platform } from 'react-native';

import type { ArchivoImagen } from './formatos';

const NUBE = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
const PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET?.trim();
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

function mensajeCloudinary(crudo?: string) {
  const texto = (crudo ?? '').toLowerCase();

  if (texto.includes('unknown api key') || texto.includes('must supply api_key')) {
    return 'Cloudinary no reconoce esta nube. En el panel copia el Cloud name (no el UUID) y un Upload preset Unsigned.';
  }

  if (texto.includes('upload preset')) {
    return 'El upload preset no existe o no es Unsigned. Créalo en Settings → Upload → Upload presets.';
  }

  if (texto.includes('file size too large')) {
    return 'El archivo supera el tamaño máximo que permite Cloudinary.';
  }

  return crudo?.trim() || 'No se pudo subir el archivo.';
}

type RespuestaCloudinary = {
  secure_url?: string;
  error?: { message?: string };
};

type Respuesta = { ok: boolean; cuerpo: RespuestaCloudinary };

/** Web: `fetch` normal con el archivo como Blob. */
async function enviarWeb(url: string, archivo: ArchivoSubida): Promise<Respuesta> {
  const form = new FormData();
  form.append('upload_preset', PRESET!);
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
function enviarNativo(url: string, archivo: ArchivoSubida): Promise<Respuesta> {
  const form = new FormData();
  form.append('upload_preset', PRESET!);
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

export async function subirACloudinary(
  archivo: ArchivoSubida,
  tipo: TipoRecurso = 'image',
): Promise<string> {
  if (!NUBE || !PRESET) {
    throw new Error('Falta la configuración de Cloudinary en el entorno.');
  }

  const url = `https://api.cloudinary.com/v1_1/${NUBE}/${tipo}/upload`;
  const { ok, cuerpo } =
    Platform.OS === 'web' ? await enviarWeb(url, archivo) : await enviarNativo(url, archivo);

  if (!ok || !cuerpo.secure_url) {
    throw new Error(mensajeCloudinary(cuerpo.error?.message));
  }

  return cuerpo.secure_url;
}

export function subirImagenACloudinary(archivo: ArchivoImagen): Promise<string> {
  return subirACloudinary(archivo, 'image');
}
