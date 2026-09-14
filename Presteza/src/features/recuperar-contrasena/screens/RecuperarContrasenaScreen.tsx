import { Pressable, Text, View } from 'react-native';

import { ContenedorPantalla } from '@/shared/components/contenedor-pantalla/ContenedorPantalla';

import Field from '../../../../components/Field';
import { useRecuperarContrasena } from '../hooks/useRecuperarContrasena';

export function RecuperarContrasenaScreen() {
  const { control, listo, error, enviar } = useRecuperarContrasena();

  return (
    <ContenedorPantalla titulo="Recuperar contraseña">
      <Text className="mt-3 text-base text-texto/70">
        Escribe tu correo. Si está registrado, te llega un enlace para cambiar la clave.
      </Text>

      <View className="mt-8">
        <Field
          control={control}
          name="email"
          label="Correo"
          placeholder="tu@email.com"
          keyboardType="email-address"
          rules={{ required: 'Escribe tu correo' }}
        />
      </View>

      {error ? <Text className="mt-4 text-sm text-red-600">{error}</Text> : null}
      {listo ? <Text className="mt-4 text-sm text-marca">{listo}</Text> : null}

      <Pressable onPress={enviar} className="mt-8 bg-marca-oscura py-4">
        <Text className="text-center text-[11px] tracking-[3px] text-crema">ENVIAR</Text>
      </Pressable>
    </ContenedorPantalla>
  );
}
