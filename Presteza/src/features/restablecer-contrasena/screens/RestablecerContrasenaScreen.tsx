import { Pressable, Text, View } from 'react-native';

import { ContenedorPantalla } from '@/shared/components/contenedor-pantalla/ContenedorPantalla';

import Field from '../../../../components/Field';
import { useRestablecerContrasena } from '../hooks/useRestablecerContrasena';

export function RestablecerContrasenaScreen() {
  const { control, error, enviar } = useRestablecerContrasena();

  return (
    <ContenedorPantalla titulo="Restablecer contraseña">
      <Text className="mt-3 text-base text-texto/70">Pega el token del correo y escribe la nueva clave.</Text>

      <View className="mt-8 gap-4">
        <Field
          control={control}
          name="token"
          label="Token"
          placeholder="Token del correo"
          rules={{ required: 'Pega el token' }}
        />
        <Field
          control={control}
          name="newPassword"
          label="Nueva contraseña"
          placeholder="Mínimo 8 caracteres"
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
      </View>

      {error ? <Text className="mt-4 text-sm text-red-600">{error}</Text> : null}

      <Pressable onPress={enviar} className="mt-8 bg-marca-oscura py-4">
        <Text className="text-center text-[11px] tracking-[3px] text-crema">GUARDAR</Text>
      </Pressable>
    </ContenedorPantalla>
  );
}
