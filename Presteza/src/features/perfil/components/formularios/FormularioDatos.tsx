import { View } from 'react-native';

import Field from '@/components/Field';
import { useFormulario } from '@/shared/hooks/useFormulario';
import { reglasCorreo, reglasTelefono } from '@/shared/validacion';
import type { PerfilForm } from '../../types';
import { AccionesFormulario } from '../elementos';

type FormularioDatosProps = {
  valores: PerfilForm;
  onCancelar: () => void;
  onGuardar: (datos: PerfilForm) => Promise<void>;
  guardando?: boolean;
};

export function FormularioDatos({ valores, onCancelar, onGuardar, guardando }: FormularioDatosProps) {
  const { control, guardar } = useFormulario(valores, onGuardar);

  return (
    <View className="gap-4">
      <Field
        control={control}
        name="complete_name"
        label="Nombre completo"
        placeholder="Ej: Ana Pérez"
        autoCapitalize="words"
        maxLength={80}
        rules={{
          required: 'Escribe tu nombre',
          minLength: { value: 3, message: 'Mínimo 3 caracteres' },
          maxLength: { value: 80, message: 'Máximo 80 caracteres' },
        }}
      />
      <Field
        control={control}
        name="email"
        label="Correo"
        placeholder="tu@email.com"
        keyboardType="email-address"
        maxLength={120}
        rules={reglasCorreo}
      />
      <Field
        control={control}
        name="phone_number"
        label="Teléfono"
        placeholder="3104941839"
        keyboardType="phone-pad"
        maxLength={10}
        rules={reglasTelefono}
      />
      <AccionesFormulario
        onCancelar={onCancelar}
        onGuardar={guardar}
        guardando={guardando}
        etiquetaGuardar="GUARDAR CAMBIOS"
      />
    </View>
  );
}
