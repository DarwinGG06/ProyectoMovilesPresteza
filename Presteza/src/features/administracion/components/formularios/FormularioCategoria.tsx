import { View } from 'react-native';

import Field from '@/components/Field';
import { useFormulario } from '@/shared/hooks/useFormulario';
import type { CategoriaForm } from '../../types';
import { AccionesForm } from './AccionesForm';

export function FormularioCategoria({
  valores,
  onGuardar,
  guardando,
}: {
  valores: CategoriaForm;
  onCancelar: () => void;
  onGuardar: (datos: CategoriaForm) => Promise<void>;
  guardando?: boolean;
}) {
  const { control, guardar } = useFormulario(valores, onGuardar);

  return (
    <View className="gap-5">
      <Field
        control={control}
        name="name"
        label="Nombre"
        placeholder="Nombre"
        autoCapitalize="words"
        maxLength={60}
        variante="linea"
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
        variante="linea"
        rules={{
          required: 'Escribe una descripción',
          maxLength: { value: 300, message: 'Máximo 300 caracteres' },
        }}
      />
      <Field
        control={control}
        name="imageUrl"
        label="Imagen"
        placeholder="https://…"
        variante="linea"
      />
      <AccionesForm onGuardar={guardar} guardando={guardando} />
    </View>
  );
}
