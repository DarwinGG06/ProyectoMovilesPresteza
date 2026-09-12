import { useForm } from 'react-hook-form';
import { View } from 'react-native';

import Field from '../../../../../components/Field';
import type { ClienteForm } from '../../types';
import { AccionesForm } from './AccionesForm';

export function FormularioCliente({
  valores,
  onCancelar,
  onGuardar,
  guardando,
}: {
  valores: ClienteForm;
  onCancelar: () => void;
  onGuardar: (datos: ClienteForm) => Promise<void>;
  guardando?: boolean;
}) {
  const { control, handleSubmit } = useForm<ClienteForm>({ defaultValues: valores });

  return (
    <View className="gap-4">
      <Field
        control={control}
        name="name"
        label="Nombre"
        autoCapitalize="words"
        rules={{ required: 'Escribe el nombre', minLength: { value: 3, message: 'Mínimo 3 caracteres' } }}
      />
      <Field
        control={control}
        name="email"
        label="Correo"
        keyboardType="email-address"
        rules={{ required: 'Escribe el correo' }}
      />
      <Field
        control={control}
        name="phone"
        label="Teléfono"
        keyboardType="phone-pad"
        rules={{ required: 'Escribe el teléfono' }}
      />
      <Field
        control={control}
        name="password"
        label="Contraseña"
        secureTextEntry
        rules={{
          required: 'Escribe la contraseña',
          minLength: { value: 8, message: 'Mínimo 8 caracteres' },
          pattern: {
            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
            message: 'Usa mayúscula, minúscula y un número',
          },
        }}
      />
      <AccionesForm onCancelar={onCancelar} onGuardar={handleSubmit(onGuardar)} guardando={guardando} />
    </View>
  );
}
