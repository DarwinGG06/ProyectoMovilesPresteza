import { useForm } from 'react-hook-form';
import { View } from 'react-native';

import Field from '@/components/Field';
import type { InsumoForm } from '../../types';
import { AccionesForm } from './AccionesForm';

export function FormularioInsumo({
  valores,
  onCancelar,
  onGuardar,
  guardando,
}: {
  valores: InsumoForm;
  onCancelar: () => void;
  onGuardar: (datos: InsumoForm) => Promise<void>;
  guardando?: boolean;
}) {
  const { control, handleSubmit } = useForm<InsumoForm>({ defaultValues: valores });

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
        name="description"
        label="Descripción"
        placeholder="Detalle del insumo"
        rules={{ required: 'Escribe una descripción' }}
      />
      <Field
        control={control}
        name="unit_price"
        label="Precio unitario"
        placeholder="Precio"
        keyboardType="numeric"
        rules={{ required: 'Escribe el precio' }}
      />
      <Field
        control={control}
        name="quantity"
        label="Cantidad"
        placeholder="Cantidad"
        keyboardType="numeric"
        rules={{ required: 'Escribe la cantidad' }}
      />
      <AccionesForm onCancelar={onCancelar} onGuardar={handleSubmit(onGuardar)} guardando={guardando} />
    </View>
  );
}
