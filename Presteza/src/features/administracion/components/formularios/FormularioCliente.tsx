import { View } from 'react-native';

import Field from '@/components/Field';
import { useFormularioCliente } from '../../hooks/useFormularioCliente';
import type { ClienteForm } from '../../types';
import { AccionesForm } from './AccionesForm';

export function FormularioCliente({
  valores,
  editando,
  onGuardar,
  guardando,
}: {
  valores: ClienteForm;
  editando?: boolean;
  onCancelar: () => void;
  onGuardar: (datos: ClienteForm) => Promise<void>;
  guardando?: boolean;
}) {
  const { control, enviar, getValues } = useFormularioCliente(valores, onGuardar);

  return (
    <View className="gap-5">
      <Field
        control={control}
        name="name"
        label="Nombre"
        autoCapitalize="words"
        variante="linea"
        maxLength={80}
        rules={{
          required: 'Escribe el nombre',
          minLength: { value: 3, message: 'Mínimo 3 caracteres' },
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
        rules={{
          required: 'Escribe el correo',
          pattern: { value: /^\S+@\S+\.\S+$/, message: 'Correo inválido' },
          maxLength: { value: 120, message: 'Máximo 120 caracteres' },
        }}
      />
      <Field
        control={control}
        name="phone"
        label="Teléfono"
        keyboardType="phone-pad"
        variante="linea"
        maxLength={20}
        rules={{
          required: 'Escribe el teléfono',
          maxLength: { value: 20, message: 'Máximo 20 caracteres' },
        }}
      />
      <Field
        control={control}
        name="password"
        label={editando ? 'Nueva contraseña (opcional)' : 'Contraseña'}
        secureTextEntry
        variante="linea"
        maxLength={72}
        rules={
          editando
            ? {
                validate: (value) => {
                  if (!value) return true;
                  if (value.length < 8) return 'Mínimo 8 caracteres';
                  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(value)) {
                    return 'Usa mayúscula, minúscula y un número';
                  }
                  return true;
                },
              }
            : {
                required: 'Escribe la contraseña',
                minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                maxLength: { value: 72, message: 'Máximo 72 caracteres' },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                  message: 'Usa mayúscula, minúscula y un número',
                },
              }
        }
      />
      {editando ? (
        <Field
          control={control}
          name="confirmation"
          label="Confirmar nueva contraseña"
          secureTextEntry
          variante="linea"
          maxLength={72}
          rules={{
            validate: (value) => value === getValues('password') || 'Las contraseñas no coinciden',
          }}
        />
      ) : null}
      <AccionesForm onGuardar={enviar} guardando={guardando} />
    </View>
  );
}
