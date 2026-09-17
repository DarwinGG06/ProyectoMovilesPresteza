import { Text, View } from 'react-native';

import Button from '@/components/Button';
import Field from '@/components/Field';
import MensajeError from '@/components/MensajeError';
import { ContenedorPantalla } from '@/shared/components/contenedor-pantalla/ContenedorPantalla';

import { useRestablecerContrasena } from '../hooks/useRestablecerContrasena';

export function RestablecerContrasenaScreen() {
  const { control, error, enviar } = useRestablecerContrasena();

  return (
    <ContenedorPantalla titulo="Restablecer contraseña">
      <Text className="mt-3 text-base text-texto/70">Pega el token del correo y escribe la nueva clave.</Text>

      <View className="mt-8 gap-5">
        <Field
          control={control}
          name="token"
          label="Token"
          placeholder="Token del correo"
          maxLength={200}
          rules={{ required: 'Pega el token', maxLength: { value: 200, message: 'Máximo 200 caracteres' } }}
        />
        <Field
          control={control}
          name="newPassword"
          label="Nueva contraseña"
          placeholder="Mínimo 8 caracteres"
          secureTextEntry
          maxLength={72}
          rules={{
            required: 'Escribe la nueva contraseña',
            minLength: { value: 8, message: 'Mínimo 8 caracteres' },
            maxLength: { value: 72, message: 'Máximo 72 caracteres' },
            pattern: {
              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
              message: 'Usa mayúscula, minúscula y un número',
            },
          }}
        />

        <MensajeError texto={error ?? undefined} />
        <Button text="GUARDAR" onPress={enviar} />
      </View>
    </ContenedorPantalla>
  );
}
