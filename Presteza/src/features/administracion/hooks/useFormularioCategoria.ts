import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useAviso } from '@/shared/components/aviso';
import {
  elegirDesdeArchivo,
  elegirDesdeCamara,
  elegirDesdeGaleria,
} from '@/services/imagen/elegir';
import {
  ImagenInvalidaError,
  urlDeImagen,
  urlPublicaImagen,
  type ArchivoImagen,
} from '@/services/imagen/formatos';
import { subirImagenACloudinary } from '@/services/imagen/subirACloudinary';

import type { CategoriaForm } from '../types';

type OpcionesFormularioCategoria = {
  valores: CategoriaForm;
  onGuardar: (datos: CategoriaForm) => Promise<void>;
  guardando?: boolean;
};

function mensajeDe(error: unknown, porDefecto: string) {
  return error instanceof Error ? error.message : porDefecto;
}

/**
 * Formulario de categoría: nombre, descripción e imagen.
 * La imagen se elige con cámara, galería o archivo, y se sube a Cloudinary
 * (carpeta `presteza/categorias`) solo al pulsar Listo.
 */
export function useFormularioCategoria({
  valores,
  onGuardar,
  guardando,
}: OpcionesFormularioCategoria) {
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
  // `handleSubmit` guarda la función de envío; el archivo se lee por referencia
  // para no quedarse con el valor del primer render.
  const archivoRef = useRef<ArchivoImagen | null>(null);
  archivoRef.current = archivo;

  const tomar = async (origen: () => Promise<ArchivoImagen | null>) => {
    try {
      const elegido = await origen();
      if (!elegido) return;
      setArchivo(elegido);
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
      const publica = urlPublicaImagen(datos.imageUrl) || urlPublicaImagen(valores.imageUrl);
      if (!local && !publica) {
        setError('imageUrl', { message: 'Elige una imagen para la categoría' });
        aviso.error('Categoría', 'Elige una imagen para la categoría.');
        return;
      }

      setSubiendo(true);
      try {
        let imageUrl = publica;
        let imagePublicId: string | undefined;
        if (local) {
          try {
            const recurso = await subirImagenACloudinary(local, 'categorias');
            imageUrl = recurso.url;
            imagePublicId = recurso.publicId || undefined;
          } catch (error) {
            const mensaje =
              error instanceof ImagenInvalidaError
                ? error.message
                : mensajeDe(error, 'No se pudo subir la imagen');
            setError('imageUrl', { message: mensaje });
            aviso.error('Imagen', mensaje);
            return;
          }
          setValue('imageUrl', imageUrl);
          setArchivo(null);
          archivoRef.current = null;
        }

        await onGuardar({ ...getValues(), imageUrl, imagePublicId });
      } catch (error) {
        aviso.errorDe(error, 'No se pudo guardar la categoría.', 'Categoría');
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
    /** Lo que se ve en el recuadro: la foto recién elegida o la que ya estaba guardada. */
    preview: archivo?.uri || urlDeImagen(watch('imageUrl')),
    ocupado: Boolean(guardando || subiendo),
    subiendo,
    guardar,
    tomarDesdeCamara: () => tomar(elegirDesdeCamara),
    tomarDesdeGaleria: () => tomar(elegirDesdeGaleria),
    tomarDesdeArchivo: () => tomar(elegirDesdeArchivo),
  };
}
