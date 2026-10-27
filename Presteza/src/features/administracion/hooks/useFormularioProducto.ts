import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  elegirDesdeArchivo,
  elegirDesdeCamara,
  elegirDesdeGaleria,
} from '@/services/imagen/elegir';
import { ImagenInvalidaError, type ArchivoImagen } from '@/services/imagen/formatos';
import { subirImagenACloudinary } from '@/services/imagen/subirACloudinary';
import {
  elegirModelo3d,
  nombreDesdeUrl,
  subirModelo3d,
  type ArchivoModelo3d,
} from '@/services/modelo3d/modelo3d';

import type { ProductoForm } from '../types';

type OpcionesFormularioProducto = {
  valores: ProductoForm;
  onGuardar: (datos: ProductoForm) => Promise<void>;
  guardando?: boolean;
};

function mensajeDe(error: unknown, porDefecto: string) {
  return error instanceof Error ? error.message : porDefecto;
}

export function useFormularioProducto({
  valores,
  onGuardar,
  guardando,
}: OpcionesFormularioProducto) {
  const { control, handleSubmit, setError, clearErrors, getValues, setValue, watch } =
    useForm<ProductoForm>({ defaultValues: valores });
  const [archivo, setArchivo] = useState<ArchivoImagen | null>(null);
  const [modelo, setModelo] = useState<ArchivoModelo3d | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [visorAbierto, setVisorAbierto] = useState(false);
  // `handleSubmit` guarda la función de envío, así que los archivos se leen por
  // referencia para no quedarse con el valor del primer render.
  const archivoRef = useRef<ArchivoImagen | null>(null);
  archivoRef.current = archivo;
  const modeloRef = useRef<ArchivoModelo3d | null>(null);
  modeloRef.current = modelo;

  const tomar = async (origen: () => Promise<ArchivoImagen | null>) => {
    try {
      const elegido = await origen();
      if (!elegido) return;
      setArchivo(elegido);
      clearErrors('imageUrl');
    } catch (error) {
      setError('imageUrl', { message: mensajeDe(error, 'No se pudo leer la imagen') });
    }
  };

  const tomarModelo = async () => {
    try {
      const elegido = await elegirModelo3d();
      if (!elegido) return;
      setModelo(elegido);
      clearErrors('modelUrl');
    } catch (error) {
      setError('modelUrl', { message: mensajeDe(error, 'No se pudo leer el modelo') });
    }
  };

  /** Quita el modelo elegido o el que ya estaba guardado en el plato. */
  const quitarModelo = () => {
    setModelo(null);
    setValue('modelUrl', '');
    clearErrors('modelUrl');
  };

  const guardar = handleSubmit(async (datos) => {
    const local = archivoRef.current;
    if (!local && !datos.imageUrl.trim()) {
      setError('imageUrl', { message: 'Elige una foto del plato' });
      return;
    }

    setSubiendo(true);
    try {
      // La imagen y el modelo se suben a la vez; cada error se muestra en su campo.
      const [imagen, modelo3d] = await Promise.allSettled([
        local ? subirImagenACloudinary(local) : Promise.resolve(datos.imageUrl.trim()),
        modeloRef.current ? subirModelo3d(modeloRef.current) : Promise.resolve(datos.modelUrl.trim()),
      ]);

      if (imagen.status === 'rejected') {
        setError('imageUrl', {
          message:
            imagen.reason instanceof ImagenInvalidaError
              ? imagen.reason.message
              : mensajeDe(imagen.reason, 'No se pudo subir la imagen'),
        });
      } else {
        setValue('imageUrl', imagen.value);
        setArchivo(null);
        archivoRef.current = null;
      }

      if (modelo3d.status === 'rejected') {
        setError('modelUrl', { message: mensajeDe(modelo3d.reason, 'No se pudo subir el modelo') });
      } else {
        setValue('modelUrl', modelo3d.value);
        setModelo(null);
        modeloRef.current = null;
      }

      if (imagen.status === 'rejected' || modelo3d.status === 'rejected') return;

      await onGuardar({ ...getValues(), imageUrl: imagen.value, modelUrl: modelo3d.value });
    } catch {
      // El aviso del admin ya dice si falló el plato o los adicionales.
    } finally {
      setSubiendo(false);
    }
  });

  const modeloGuardado = watch('modelUrl');

  return {
    control,
    preview: archivo?.uri || watch('imageUrl'),
    ocupado: Boolean(guardando || subiendo),
    subiendo,
    guardar,
    tomarDesdeCamara: () => tomar(elegirDesdeCamara),
    tomarDesdeGaleria: () => tomar(elegirDesdeGaleria),
    tomarDesdeArchivo: () => tomar(elegirDesdeArchivo),
    modelo3d: {
      /** Lo que lee el visor: el archivo recién elegido o la URL ya guardada. */
      fuente: modelo?.uri || modeloGuardado || null,
      nombre: modelo?.nombre || (modeloGuardado ? nombreDesdeUrl(modeloGuardado) : null),
      pendiente: Boolean(modelo),
      elegir: tomarModelo,
      quitar: quitarModelo,
      visorAbierto,
      abrirVisor: () => setVisorAbierto(true),
      cerrarVisor: () => setVisorAbierto(false),
    },
  };
}
