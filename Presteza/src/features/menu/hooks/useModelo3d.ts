import { useEffect, useState } from 'react';
import * as FileSystem from 'expo-file-system/legacy';

/**
 * Prepara la fuente que recibe el visor 3D. Los archivos locales (file://) se
 * convierten a Base64 porque el WebView no puede leerlos directamente.
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

      if (modelUrl.startsWith('http://') || modelUrl.startsWith('https://') || modelUrl.startsWith('data:')) {
        setFuente(modelUrl);
        return;
      }

      if (!modelUrl.startsWith('file://')) {
        setFuente(modelUrl);
        return;
      }

      try {
        setProcesando(true);
        const base64 = await FileSystem.readAsStringAsync(modelUrl, {
          encoding: FileSystem.EncodingType.Base64,
        });
        if (montado) setFuente(`data:model/gltf-binary;base64,${base64}`);
      } catch (err) {
        console.error('Error al convertir modelo local a Base64:', err);
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
