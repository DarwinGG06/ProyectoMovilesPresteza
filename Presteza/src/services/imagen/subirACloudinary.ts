import { Platform } from 'react-native';

import type { ArchivoImagen } from './formatos';

const NUBE = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
const PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET?.trim();
const TIMEOUT_MS = 60000;

function mensajeCloudinary(crudo?: string) {
  const texto = (crudo ?? '').toLowerCase();
  if (texto.includes('unknown api key') || texto.includes('must supply api_key')) {
    return 'Cloudinary no reconoce esta nube. En el panel copia el Cloud name (no el UUID) y un Upload preset Unsigned.';
  }
  if (texto.includes('upload preset')) {
    return 'El upload preset no existe o no es Unsigned. Créalo en Settings → Upload → Upload presets.';
  }
  return crudo?.trim() || 'No se pudo subir la imagen.';
}

type RespuestaCloudinary = {
  secure_url?: string;
  error?: { message?: string };
};

async function cuerpoArchivo(archivo: ArchivoImagen): Promise<string | Blob> {
  if (Platform.OS === 'web') {
    const respuesta = await fetch(archivo.uri);
    return respuesta.blob();
  }
  return {
    uri: archivo.uri,
    type: archivo.mime,
    name: archivo.nombre,
  } as unknown as Blob;
}

export async function subirImagenACloudinary(archivo: ArchivoImagen): Promise<string> {
  if (!NUBE || !PRESET) {
    throw new Error('Falta la configuración de Cloudinary en el entorno.');
  }

  const form = new FormData();
  form.append('upload_preset', PRESET);
  const file = await cuerpoArchivo(archivo);
  if (Platform.OS === 'web' && file instanceof Blob) {
    form.append('file', file, archivo.nombre);
  } else if (typeof file === 'string') {
    form.append('file', file);
  } else {
    form.append('file', file);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const respuesta = await fetch(`https://api.cloudinary.com/v1_1/${NUBE}/image/upload`, {
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
      throw new Error('La subida tardó demasiado. Intenta con una imagen más liviana.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
