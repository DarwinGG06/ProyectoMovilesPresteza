import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';

import { forgotPasswordApi } from '@/auth/authApi';
import { ContenedorPantalla } from '@/shared/components/contenedor-pantalla/ContenedorPantalla';

import Field from '../../../../components/Field';

type RecuperarForm = {
  email: string;
};

export function RecuperarContrasenaScreen() {
  const [listo, setListo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { control, handleSubmit } = useForm<RecuperarForm>({
    defaultValues: { email: '' },
  });

  const enviar = handleSubmit(async (datos) => {
    setError(null);
    setListo(null);
    try {
      const respuesta = await forgotPasswordApi(datos.email);
      setListo(respuesta.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el correo.');
    }
  });

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
