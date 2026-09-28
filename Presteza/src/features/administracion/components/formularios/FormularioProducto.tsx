import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';

import Field from '@/components/Field';
import Select from '@/components/Select';
import { elegirDesdeArchivo, elegirDesdeCamara, elegirDesdeGaleria } from '@/services/imagen/elegir';
import { ImagenInvalidaError, type ArchivoImagen } from '@/services/imagen/formatos';
import { subirImagenACloudinary } from '@/services/imagen/subirACloudinary';
import type { CategoriaAdmin, ProductoForm } from '../../types';
import { idDe } from '../../utils';
import { AccionesForm } from './AccionesForm';
import { CampoImagenProducto } from './CampoImagenProducto';

type FormularioProductoProps = {
  valores: ProductoForm;
  categorias: CategoriaAdmin[];
  onCancelar: () => void;
  onGuardar: (datos: ProductoForm) => Promise<void>;
  guardando?: boolean;
};

export function FormularioProducto({
  valores,
  categorias,
  onCancelar,
  onGuardar,
  guardando,
}: FormularioProductoProps) {
  const { control, handleSubmit, setError, clearErrors, getValues, setValue, watch } = useForm<ProductoForm>({
    defaultValues: valores,
  });
  const [archivo, setArchivo] = useState<ArchivoImagen | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const archivoRef = useRef<ArchivoImagen | null>(null);
  archivoRef.current = archivo;

  const ocupado = Boolean(guardando || subiendo);
  const preview = archivo?.uri || watch('imageUrl');

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

  return (
    <View className="gap-4">
      <Field
        control={control}
        name="name"
        label="Nombre"
        placeholder="Nombre del plato"
        autoCapitalize="words"
        maxLength={80}
        rules={{
          required: 'Escribe el nombre',
          minLength: { value: 3, message: 'Mínimo 3 caracteres' },
          maxLength: { value: 80, message: 'Máximo 80 caracteres' },
        }}
      />
      <Field
        control={control}
        name="description"
        label="Descripción"
        placeholder="Ingredientes y preparación"
        multiline
        maxLength={400}
        rules={{
          required: 'Escribe una descripción',
          maxLength: { value: 400, message: 'Máximo 400 caracteres' },
        }}
      />
      <Field
        control={control}
        name="price"
        label="Precio"
        placeholder="Precio"
        keyboardType="numeric"
        rules={{ required: 'Escribe el precio' }}
      />
      <Controller
        control={control}
        name="imageUrl"
        render={({ fieldState: { error } }) => (
          <CampoImagenProducto
            uri={preview}
            error={error?.message}
            disabled={ocupado}
            onCamara={() => tomar(elegirDesdeCamara)}
            onGaleria={() => tomar(elegirDesdeGaleria)}
            onArchivo={() => tomar(elegirDesdeArchivo)}
          />
        )}
      />
      <Select
        control={control}
        name="categoryId"
        label="Categoría"
        options={categorias.map((categoria) => ({ value: idDe(categoria), label: categoria.name }))}
        rules={{ required: 'Elige una categoría' }}
      />
      <AccionesForm
        onCancelar={onCancelar}
        onGuardar={guardar}
        guardando={ocupado}
        etiqueta={subiendo ? 'SUBIENDO…' : 'GUARDAR'}
      />
    </View>
  );
}
