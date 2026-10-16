import { View } from 'react-native';

import Field from '@/components/Field';
import { useFormulario } from '@/shared/hooks/useFormulario';
import type { AdicionalForm } from '../../types';
import { AccionesForm } from './AccionesForm';

export function FormularioAdicional({
  valores,
  onGuardar,
  guardando,
}: {
  valores: AdicionalForm;
  onCancelar: () => void;
  onGuardar: (datos: AdicionalForm) => Promise<void>;
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
        variante="linea"
        rules={{ required: 'Escribe el nombre' }}
      />
      <Field
        control={control}
        name="price"
        label="Precio"
        placeholder="0"
        keyboardType="numeric"
        variante="linea"
        rules={{ required: 'Escribe el precio' }}
      />
      <AccionesForm onGuardar={guardar} guardando={guardando} />
    </View>
  );
}
