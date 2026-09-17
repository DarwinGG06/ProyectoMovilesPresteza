import { useForm } from 'react-hook-form';
import { View } from 'react-native';

import Field from '@/components/Field';
import type { PerfilForm } from '../../types';
import { AccionesFormulario } from '../elementos';

type FormularioDatosProps = {
  valores: PerfilForm;
  onCancelar: () => void;
  onGuardar: (datos: PerfilForm) => Promise<void>;
  guardando?: boolean;
};

export function FormularioDatos({ valores, onCancelar, onGuardar, guardando }: FormularioDatosProps) {
  const { control, handleSubmit } = useForm<PerfilForm>({
    defaultValues: valores,
  });

  return (
    <View className="gap-4">
      <Field
        control={control}
        name="complete_name"
        label="Nombre completo"
        placeholder="Ej: Ana Pérez"
        autoCapitalize="words"
        rules={{
          required: 'Escribe tu nombre',
          minLength: { value: 3, message: 'Mínimo 3 caracteres' },
        }}
      />
      <Field
        control={control}
        name="email"
        label="Correo"
        placeholder="tu@email.com"
        keyboardType="email-address"
        rules={{
          required: 'Escribe tu correo',
          pattern: { value: /\S+@\S+\.\S+/, message: 'Correo no válido' },
        }}
      />
      <Field
        control={control}
        name="phone_number"
        label="Teléfono"
        placeholder="3104941839"
        keyboardType="phone-pad"
        rules={{
          required: 'Escribe tu teléfono',
          pattern: { value: /^[0-9]{10}$/, message: 'Deben ser 10 dígitos' },
        }}
      />
      <AccionesFormulario
        onCancelar={onCancelar}
        onGuardar={handleSubmit(onGuardar)}
        guardando={guardando}
        etiquetaGuardar="GUARDAR CAMBIOS"
      />
    </View>
  );
}
