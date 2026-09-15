import { useForm } from 'react-hook-form';
import { View } from 'react-native';

import Field from '@/components/Field';
import type { AdicionalForm } from '../../types';
import { AccionesForm } from './AccionesForm';

export function FormularioAdicional({
  valores,
  onCancelar,
  onGuardar,
  guardando,
}: {
  valores: AdicionalForm;
  onCancelar: () => void;
  onGuardar: (datos: AdicionalForm) => Promise<void>;
  guardando?: boolean;
}) {
  const { control, handleSubmit } = useForm<AdicionalForm>({ defaultValues: valores });

  return (
    <View className="gap-4">
      <Field
        control={control}
        name="name"
        label="Nombre"
        placeholder="Nombre"
        autoCapitalize="words"
        rules={{ required: 'Escribe el nombre' }}
      />
      <Field
        control={control}
        name="price"
        label="Precio"
        placeholder="Precio"
        keyboardType="numeric"
        rules={{ required: 'Escribe el precio' }}
      />
      <AccionesForm onCancelar={onCancelar} onGuardar={handleSubmit(onGuardar)} guardando={guardando} />
    </View>
  );
}
