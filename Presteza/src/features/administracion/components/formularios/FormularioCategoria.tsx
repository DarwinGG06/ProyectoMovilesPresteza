import { useForm } from 'react-hook-form';
import { View } from 'react-native';

import Field from '@/components/Field';
import type { CategoriaForm } from '../../types';
import { AccionesForm } from './AccionesForm';

export function FormularioCategoria({
  valores,
  onCancelar,
  onGuardar,
  guardando,
}: {
  valores: CategoriaForm;
  onCancelar: () => void;
  onGuardar: (datos: CategoriaForm) => Promise<void>;
  guardando?: boolean;
}) {
  const { control, handleSubmit } = useForm<CategoriaForm>({ defaultValues: valores });

  return (
    <View className="gap-4">
      <Field
        control={control}
        name="name"
        label="Nombre"
        placeholder="Nombre"
        autoCapitalize="words"
        maxLength={60}
        rules={{
          required: 'Escribe el nombre',
          maxLength: { value: 60, message: 'Máximo 60 caracteres' },
        }}
      />
      <Field
        control={control}
        name="description"
        label="Descripción"
        placeholder="Descripción"
        maxLength={300}
        rules={{
          required: 'Escribe una descripción',
          maxLength: { value: 300, message: 'Máximo 300 caracteres' },
        }}
      />
      <Field control={control} name="imageUrl" label="Imagen (URL)" placeholder="https://..." />
      <AccionesForm onCancelar={onCancelar} onGuardar={handleSubmit(onGuardar)} guardando={guardando} />
    </View>
  );
}
