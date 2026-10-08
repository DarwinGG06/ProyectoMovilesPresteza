import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  elegirDesdeArchivo,
  elegirDesdeCamara,
  elegirDesdeGaleria,
} from '@/services/imagen/elegir';
import { ImagenInvalidaError, type ArchivoImagen } from '@/services/imagen/formatos';
import { subirImagenACloudinary } from '@/services/imagen/subirACloudinary';

import type { ProductoForm } from '../types';

type OpcionesFormularioProducto = {
  valores: ProductoForm;
  onGuardar: (datos: ProductoForm) => Promise<void>;
  guardando?: boolean;
};

export function useFormularioProducto({
  valores,
  onGuardar,
  guardando,
}: OpcionesFormularioProducto) {
  const { control, handleSubmit, setError, clearErrors, getValues, setValue, watch } =
    useForm<ProductoForm>({ defaultValues: valores });
  const [archivo, setArchivo] = useState<ArchivoImagen | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  // `handleSubmit` guarda la función de envío, así que el archivo se lee por
  // referencia para no quedarse con el valor del primer render.
  const archivoRef = useRef<ArchivoImagen | null>(null);
  archivoRef.current = archivo;

  const tomar = async (origen: () => Promise<ArchivoImagen | null>) => {
    try {
      const elegido = await origen();
      if (!elegido) return;
      setArchivo(elegido);
      clearErrors('imageUrl');
    } catch (error) {
      setError('imageUrl', {
        message: error instanceof Error ? error.message : 'No se pudo leer la imagen',
      });
    }
  };

  const guardar = handleSubmit(async (datos) => {
    const local = archivoRef.current;
    if (!local && !datos.imageUrl.trim()) {
      setError('imageUrl', { message: 'Elige una foto del plato' });
      return;
    }

    setSubiendo(true);
    try {
      const imageUrl = local ? await subirImagenACloudinary(local) : datos.imageUrl.trim();
      setValue('imageUrl', imageUrl);
      setArchivo(null);
      archivoRef.current = null;
      await onGuardar({ ...getValues(), imageUrl });
    } catch (error) {
      const mensaje =
        error instanceof ImagenInvalidaError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'No se pudo subir la imagen';
      setError('imageUrl', { message: mensaje });
    } finally {
      setSubiendo(false);
    }
  });

  return {
    control,
    preview: archivo?.uri || watch('imageUrl'),
    ocupado: Boolean(guardando || subiendo),
    subiendo,
    guardar,
    tomarDesdeCamara: () => tomar(elegirDesdeCamara),
    tomarDesdeGaleria: () => tomar(elegirDesdeGaleria),
    tomarDesdeArchivo: () => tomar(elegirDesdeArchivo),
  };
}
