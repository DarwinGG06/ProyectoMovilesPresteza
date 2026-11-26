import { View } from 'react-native';

import Field from '@/components/Field';
import { useFormulario } from '@/shared/hooks/useFormulario';
import { reglasCorreo, reglasTelefono } from '@/shared/validacion';
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
    <View className="gap-3 pb-1">
      <Field
        control={control}
        name="name"
        label="Nombre"
        autoCapitalize="words"
        variante="linea"
        maxLength={80}
        rules={{
          required: 'Escribe el nombre',
          minLength: { value: 2, message: 'Mínimo 2 caracteres' },
          maxLength: { value: 80, message: 'Máximo 80 caracteres' },
        }}
      />
      <Field
        control={control}
        name="email"
        label="Correo"
        keyboardType="email-address"
        variante="linea"
        maxLength={120}
        rules={reglasCorreo}
      />
      <Field
        control={control}
        name="phone"
        label="Teléfono"
        keyboardType="phone-pad"
        variante="linea"
        maxLength={10}
        rules={reglasTelefono}
      />
      <AccionesForm onGuardar={guardar} guardando={guardando} />
    </View>
  );
}
