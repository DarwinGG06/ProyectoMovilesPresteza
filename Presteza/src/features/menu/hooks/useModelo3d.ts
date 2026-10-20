import { useEffect, useState } from 'react';
import { File } from 'expo-file-system';

const PREFIJO_GLB = 'data:model/gltf-binary;base64,';

function esRemoto(uri: string) {
  return uri.startsWith('http://') || uri.startsWith('https://') || uri.startsWith('data:');
}

function esLocal(uri: string) {
  return uri.startsWith('file://') || uri.startsWith('content://');
}

/** Descarga la `uri` como Blob con el `XMLHttpRequest` de React Native. */
function blobConXhr(uri: string) {
  return new Promise<Blob>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', uri);
    xhr.responseType = 'blob';
    xhr.onload = () => resolve(xhr.response as Blob);
    xhr.onerror = () => reject(new Error('No se pudo leer el archivo'));
    xhr.send();
  });
}

/**
 * Lee el archivo con el módulo de red de React Native (`XMLHttpRequest` +
 * `FileReader`). En Expo Go, `expo-file-system` no deja leer la copia que
 * DocumentPicker guarda en la caché ("Missing 'READ' permission"), y el `fetch`
 * de este SDK (el de Expo) no lee `file://`; el XHR de React Native sí puede.
 */
async function base64ConXhr(uri: string) {
  const blob = await blobConXhr(uri);
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const lector = new FileReader();
    lector.onloadend = () => resolve(String(lector.result ?? ''));
    lector.onerror = () => reject(lector.error ?? new Error('No se pudo leer el archivo'));
    lector.readAsDataURL(blob);
  });
  const coma = dataUrl.indexOf(',');
  if (coma < 0 || coma === dataUrl.length - 1) throw new Error('El archivo está vacío');
  return dataUrl.slice(coma + 1);
}

/** Intenta primero con XHR y, si falla, con `expo-file-system` (builds propios). */
async function leerBase64(uri: string) {
  try {
    return await base64ConXhr(uri);
  } catch {
    return await new File(uri).base64();
  }
}

/**
 * Prepara la fuente que recibe el visor 3D. Los archivos locales (file:// o
 * content://) se convierten a Base64 porque el WebView no puede leerlos
 * directamente. Las URLs de Cloudinary pasan tal cual.
 */
export function useModelo3d(modelUrl: string | null) {
  const [fuente, setFuente] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    let montado = true;

    async function preparar() {
      if (!modelUrl) {
        setFuente(null);
        return;
      }

      if (esRemoto(modelUrl) || !esLocal(modelUrl)) {
        setFuente(modelUrl);
        return;
      }

      try {
        setProcesando(true);
        const base64 = await leerBase64(modelUrl);
        if (montado) setFuente(`${PREFIJO_GLB}${base64}`);
      } catch (err) {
        // Último intento: pasar la ruta tal cual al visor.
        console.warn('No se pudo leer el modelo local para la vista previa:', err);
        if (montado) setFuente(modelUrl);
      } finally {
        if (montado) setProcesando(false);
      }
    }

    preparar();

    return () => {
      montado = false;
    };
  }, [modelUrl]);

  return { fuente, procesando };
}
