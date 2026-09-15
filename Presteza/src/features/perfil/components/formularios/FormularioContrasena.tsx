import { useForm } from 'react-hook-form';
import { View } from 'react-native';

import Field from '@/components/Field';
import type { ContrasenaForm } from '../../types';
import { AccionesFormulario } from '../elementos';

type FormularioContrasenaProps = {
  onCancelar: () => void;
  onGuardar: (datos: ContrasenaForm) => Promise<void>;
  guardando?: boolean;
};

export function FormularioContrasena({ onCancelar, onGuardar, guardando }: FormularioContrasenaProps) {
  const { control, handleSubmit, getValues } = useForm<ContrasenaForm>({
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  return (
    <View className="gap-4">
      <Field
        control={control}
        name="newPassword"
        label="Nueva contraseña"
        placeholder="Ej: Presteza1"
        secureTextEntry
        rules={{
          required: 'Escribe la nueva contraseña',
          minLength: { value: 8, message: 'Mínimo 8 caracteres' },
          pattern: {
            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
            message: 'Usa mayúscula, minúscula y un número',
          },
        }}
      />
      <Field
        control={control}
        name="confirmPassword"
        label="Confirmar contraseña"
        placeholder="Repite la contraseña"
        secureTextEntry
        rules={{
          required: 'Confirma la contraseña',
          validate: (valor) => valor === getValues('newPassword') || 'Las contraseñas no coinciden',
        }}
      />
      <AccionesFormulario
        onCancelar={onCancelar}
        onGuardar={handleSubmit(onGuardar)}
        guardando={guardando}
        etiquetaGuardar="CAMBIAR CONTRASEÑA"
      />
    </View>
  );
}
