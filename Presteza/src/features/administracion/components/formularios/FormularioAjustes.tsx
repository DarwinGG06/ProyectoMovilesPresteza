import { View } from 'react-native';

import Field from '@/components/Field';
import { useFormulario } from '@/shared/hooks/useFormulario';
import type { AjustesForm } from '../../types';
import { AccionesForm } from './AccionesForm';

export function FormularioAjustes({
  valores,
  onGuardar,
  guardando,
}: {
  valores: AjustesForm;
  onGuardar: (datos: AjustesForm) => Promise<void>;
  guardando?: boolean;
}) {
  const { control, guardar } = useFormulario(valores, onGuardar);

  return (
    <View className="gap-4">
      <Field
        control={control}
        name="name"
        label="Nombre"
        autoCapitalize="words"
        rules={{ required: 'Escribe el nombre' }}
      />
      <Field
        control={control}
        name="email"
        label="Correo"
        keyboardType="email-address"
        rules={{ required: 'Escribe el correo' }}
      />
      <Field control={control} name="phone" label="Teléfono" keyboardType="phone-pad" rules={{ required: 'Escribe el teléfono' }} />
      <AccionesForm onGuardar={guardar} guardando={guardando} etiqueta="GUARDAR" />
    </View>
  );
}
