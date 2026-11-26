import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useAviso } from '@/shared/components/aviso';
import {
  elegirDesdeArchivo,
  elegirDesdeCamara,
  elegirDesdeGaleria,
} from '@/services/imagen/elegir';
import {
  archivoDesdeUri,
  esUriLocal,
  ImagenInvalidaError,
  urlDeImagen,
  urlPublicaImagen,
  type ArchivoImagen,
} from '@/services/imagen/formatos';
import { subirImagenACloudinary } from '@/services/imagen/subirACloudinary';

import type { CategoriaForm } from '../types';

function mensajeDe(error: unknown, porDefecto: string) {
  return error instanceof Error ? error.message : porDefecto;
}

export function useFormularioCategoria(
  valores: CategoriaForm,
  onGuardar: (datos: CategoriaForm) => Promise<void>,
  guardando?: boolean,
) {
  const aviso = useAviso();
  const { control, handleSubmit, setError, clearErrors, getValues, setValue, watch } =
    useForm<CategoriaForm>({
      defaultValues: {
        name: valores.name ?? '',
        description: valores.description ?? '',
        imageUrl: valores.imageUrl ?? '',
      },
    });
  const [archivo, setArchivo] = useState<ArchivoImagen | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const archivoRef = useRef<ArchivoImagen | null>(null);
  archivoRef.current = archivo;

  const tomar = async (origen: () => Promise<ArchivoImagen | null>) => {
    try {
      const elegido = await origen();
      if (!elegido) return;
      setArchivo(elegido);
      setValue('imageUrl', elegido.uri);
      clearErrors('imageUrl');
    } catch (error) {
      const mensaje = mensajeDe(error, 'No se pudo leer la imagen');
      setError('imageUrl', { message: mensaje });
      aviso.error('Imagen', mensaje);
    }
  };

  const guardar = handleSubmit(
    async (datos) => {
      const local = archivoRef.current;
      const foto = urlDeImagen(datos.imageUrl) || urlDeImagen(valores.imageUrl);
      const publica = urlPublicaImagen(foto);
      const pendiente = local ?? (foto && esUriLocal(foto) ? archivoDesdeUri(foto) : null);
      if (!pendiente && !publica) {
        setError('imageUrl', { message: 'Elige una foto de la categoría' });
        aviso.error('Categoría', 'Elige una foto de la categoría.');
        return;
      }

      setSubiendo(true);
      try {
        const url =
          pendiente
            ? (await subirImagenACloudinary(pendiente)).url
            : publica;
        const urlLista = urlPublicaImagen(url) || publica;
        if (!urlLista) {
          setError('imageUrl', { message: 'La foto no quedó lista. Elige la imagen otra vez.' });
          aviso.error('Imagen', 'La foto no quedó lista. Elige la imagen otra vez.');
          return;
        }
        setValue('imageUrl', urlLista);
        setArchivo(null);
        archivoRef.current = null;
        await onGuardar({ ...getValues(), imageUrl: urlLista });
      } catch (error) {
        const mensaje =
          error instanceof ImagenInvalidaError
            ? error.message
            : mensajeDe(error, 'No se pudo subir la imagen');
        setError('imageUrl', { message: mensaje });
        aviso.error('Imagen', mensaje);
      } finally {
        setSubiendo(false);
      }
    },
    (errores) => {
      const primero = Object.values(errores)[0];
      const mensaje =
        primero && typeof primero === 'object' && 'message' in primero && primero.message
          ? String(primero.message)
          : 'Revisa nombre, descripción e imagen.';
      aviso.error('Categoría', mensaje);
    },
  );

  return {
    control,
    preview: archivo?.uri || urlDeImagen(watch('imageUrl')),
    ocupado: Boolean(guardando || subiendo),
    guardar,
    tomarDesdeCamara: () => tomar(elegirDesdeCamara),
    tomarDesdeGaleria: () => tomar(elegirDesdeGaleria),
    tomarDesdeArchivo: () => tomar(elegirDesdeArchivo),
  };
}
