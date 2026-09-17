import { useForm } from 'react-hook-form';
import { View } from 'react-native';

import Field from '@/components/Field';
import Select from '@/components/Select';
import type { CategoriaAdmin, ProductoForm } from '../../types';
import { idDe } from '../../utils';
import { AccionesForm } from './AccionesForm';

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
  const { control, handleSubmit } = useForm<ProductoForm>({ defaultValues: valores });

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
      <Field
        control={control}
        name="imageUrl"
        label="Imagen (URL)"
        placeholder="https://..."
        maxLength={500}
        rules={{
          required: 'Pega la URL de la foto',
          maxLength: { value: 500, message: 'Máximo 500 caracteres' },
        }}
      />
      <Select
        control={control}
        name="categoryId"
        label="Categoría"
        options={categorias.map((categoria) => ({ value: idDe(categoria), label: categoria.name }))}
        rules={{ required: 'Elige una categoría' }}
      />
      <AccionesForm onCancelar={onCancelar} onGuardar={handleSubmit(onGuardar)} guardando={guardando} />
    </View>
  );
}
