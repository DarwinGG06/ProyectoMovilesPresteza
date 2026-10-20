import { Platform } from 'react-native';
import { File } from 'expo-file-system';

import type { ArchivoImagen } from './formatos';

const NUBE = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
const PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET?.trim();
const TIMEOUT_MS = 60000;

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

export async function subirACloudinary(
  archivo: ArchivoSubida,
  tipo: TipoRecurso = 'image',
): Promise<string> {
  if (!NUBE || !PRESET) {
    throw new Error('Falta la configuración de Cloudinary en el entorno.');
  }

  const form = new FormData();

  form.append('upload_preset', PRESET);

  if (Platform.OS === 'web') {
    const respuestaArchivo = await fetch(archivo.uri);
    const blob = await respuestaArchivo.blob();

    form.append('file', blob, archivo.nombre);
  } else {
    const file = new File(archivo.uri);

    form.append('file', file as any);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const respuesta = await fetch(`https://api.cloudinary.com/v1_1/${NUBE}/${tipo}/upload`, {
      method: 'POST',
      body: form,
      signal: controller.signal,
    });

    const cuerpo = (await respuesta.json()) as RespuestaCloudinary;

    if (!respuesta.ok || !cuerpo.secure_url) {
      throw new Error(mensajeCloudinary(cuerpo.error?.message));
    }

    return cuerpo.secure_url;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('La subida tardó demasiado. Intenta con un archivo más liviano.');
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export function subirImagenACloudinary(archivo: ArchivoImagen): Promise<string> {
  return subirACloudinary(archivo, 'image');
}
