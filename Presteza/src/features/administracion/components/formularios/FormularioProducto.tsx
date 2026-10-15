import { Controller } from 'react-hook-form';
import { View } from 'react-native';

import Field from '@/components/Field';
import Select from '@/components/Select';

import { useFormularioProducto } from '../../hooks/useFormularioProducto';
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
  const formulario = useFormularioProducto({ valores, onGuardar, guardando });

  return (
    <View className="gap-4">
      <Field
        control={formulario.control}
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
        control={formulario.control}
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
        control={formulario.control}
        name="price"
        label="Precio"
        placeholder="Precio"
        keyboardType="numeric"
        rules={{ required: 'Escribe el precio' }}
      />
      <Controller
        control={formulario.control}
        name="imageUrl"
        render={({ fieldState: { error } }) => (
          <CampoImagenProducto
            uri={formulario.preview}
            error={error?.message}
            disabled={formulario.ocupado}
            onCamara={formulario.tomarDesdeCamara}
            onGaleria={formulario.tomarDesdeGaleria}
            onArchivo={formulario.tomarDesdeArchivo}
          />
        )}
      />
      <Select
        control={formulario.control}
        name="categoryId"
        label="Categoría"
        options={categorias.map((categoria) => ({ value: idDe(categoria), label: categoria.name }))}
        rules={{ required: 'Elige una categoría' }}
      />
      <AccionesForm
        onCancelar={onCancelar}
        onGuardar={formulario.guardar}
        guardando={formulario.ocupado}
        etiqueta={formulario.subiendo ? 'SUBIENDO…' : 'GUARDAR'}
      />
    </View>
  );
}
