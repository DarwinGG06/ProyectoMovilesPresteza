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

function texto(valor?: string | null) {
  return urlDeImagen(valor);
}

export function useFormularioProducto({
  valores,
  onGuardar,
  guardando,
}: OpcionesFormularioProducto) {
  const aviso = useAviso();
  const { control, handleSubmit, setError, clearErrors, getValues, setValue, watch } =
    useForm<ProductoForm>({
      defaultValues: {
        name: valores.name ?? '',
        description: valores.description ?? '',
        price: valores.price ?? '',
        categoryId: valores.categoryId ?? '',
        imageUrl: valores.imageUrl ?? '',
        modelUrl: valores.modelUrl ?? '',
        adicionalIds: valores.adicionalIds ?? [],
      },
    });
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
      setValue('imageUrl', elegido.uri);
      clearErrors('imageUrl');
    } catch (error) {
      const mensaje = mensajeDe(error, 'No se pudo leer la imagen');
      setError('imageUrl', { message: mensaje });
      aviso.error('Imagen', mensaje);
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

  const guardar = handleSubmit(
    async (datos) => {
    const local = archivoRef.current;
    const foto = texto(datos.imageUrl) || texto(valores.imageUrl);
    const modeloUrl = texto(datos.modelUrl) || texto(valores.modelUrl);
    const publica = urlPublicaImagen(foto);
    const pendiente = local ?? (foto && esUriLocal(foto) ? archivoDesdeUri(foto) : null);
    if (!pendiente && !publica) {
      setError('imageUrl', { message: 'Elige una foto del plato' });
      aviso.error('Plato', 'Elige una foto del plato.');
      return;
    }

    setSubiendo(true);
    try {
      // La imagen y el modelo se suben a la vez; cada error se muestra en su campo.
      // Se guarda URL + public_id; si no se subió nada nuevo, el public_id va vacío
      // y el backend conserva el que ya tenía.
      const [imagenSubida, modeloSubido] = await Promise.allSettled([
        pendiente
          ? subirImagenACloudinary(pendiente)
          : Promise.resolve({ url: publica, publicId: '' }),
        modeloRef.current
          ? subirModelo3d(modeloRef.current)
          : Promise.resolve({ url: modeloUrl, publicId: '' }),
      ]);
      const imagen =
        imagenSubida.status === 'fulfilled'
          ? { status: 'fulfilled' as const, value: imagenSubida.value.url }
          : imagenSubida;
      const modelo3d =
        modeloSubido.status === 'fulfilled'
          ? { status: 'fulfilled' as const, value: modeloSubido.value.url }
          : modeloSubido;

      if (imagen.status === 'rejected') {
        const mensaje =
          imagen.reason instanceof ImagenInvalidaError
            ? imagen.reason.message
            : mensajeDe(imagen.reason, 'No se pudo subir la imagen');
        setError('imageUrl', { message: mensaje });
        aviso.error('Imagen', mensaje);
      } else {
        setValue('imageUrl', imagen.value);
        setArchivo(null);
        archivoRef.current = null;
      }

      if (modelo3d.status === 'rejected') {
        const mensaje = mensajeDe(modelo3d.reason, 'No se pudo subir el modelo');
        setError('modelUrl', { message: mensaje });
        aviso.error('Modelo 3D', mensaje);
      } else {
        setValue('modelUrl', modelo3d.value);
        setModelo(null);
        modeloRef.current = null;
      }

      if (imagen.status === 'rejected' || modelo3d.status === 'rejected') return;

      const urlLista = urlPublicaImagen(imagen.value) || publica;
      if (!urlLista) {
        setError('imageUrl', { message: 'La foto no quedó lista. Elige la imagen otra vez.' });
        aviso.error('Imagen', 'La foto no quedó lista. Elige la imagen otra vez.');
        return;
      }

      await onGuardar({
        ...getValues(),
        imageUrl: urlLista,
        imagePublicId:
          imagenSubida.status === 'fulfilled' ? imagenSubida.value.publicId || undefined : undefined,
        modelUrl: modelo3d.value || modeloUrl,
        modelPublicId:
          modeloSubido.status === 'fulfilled' ? modeloSubido.value.publicId || undefined : undefined,
        adicionalIds: datos.adicionalIds ?? [],
      });
    } catch (error) {
      aviso.errorDe(error, 'No se pudo guardar el plato.', 'Plato');
    } finally {
      setSubiendo(false);
    }
    },
    (errores) => {
      const primero = Object.values(errores)[0];
      const mensaje =
        primero && typeof primero === 'object' && 'message' in primero && primero.message
          ? String(primero.message)
          : 'Revisa nombre, descripción, precio y categoría.';
      aviso.error('Plato', mensaje);
    },
  );

  const modeloGuardado = watch('modelUrl');

  return {
    control,
    preview: archivo?.uri || urlDeImagen(watch('imageUrl')),
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
