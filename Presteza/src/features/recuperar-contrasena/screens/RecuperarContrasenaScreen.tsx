import { Text, View } from 'react-native';

import Button from '@/components/Button';
import Field from '@/components/Field';
import MensajeError from '@/components/MensajeError';
import { ContenedorPantalla } from '@/shared/components/contenedor-pantalla/ContenedorPantalla';

import { useRecuperarContrasena } from '../hooks/useRecuperarContrasena';

export function RecuperarContrasenaScreen() {
  const { control, listo, error, enviar } = useRecuperarContrasena();

  return (
    <ContenedorPantalla titulo="Recuperar contraseña">
      <Text className="mt-3 text-base text-texto/70">
        Escribe tu correo. Si está registrado, te llega un enlace para cambiar la clave.
      </Text>

      <View className="mt-8 gap-5">
        <Field
          control={control}
          name="email"
          label="Correo"
          placeholder="tu@email.com"
          keyboardType="email-address"
          maxLength={120}
          rules={{
            required: 'Escribe tu correo',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Correo inválido' },
            maxLength: { value: 120, message: 'Máximo 120 caracteres' },
          }}
        />

        <MensajeError texto={error ?? undefined} />
        {listo ? <Text className="rounded-lg bg-emerald-50 p-3 text-center text-emerald-800">{listo}</Text> : null}

        <Button text="ENVIAR" onPress={enviar} />
      </View>
    </ContenedorPantalla>
  );
}
