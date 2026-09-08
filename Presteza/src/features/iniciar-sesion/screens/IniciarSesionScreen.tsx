import { router } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';

import { useAuth } from '@/auth/AuthContext';
import { ContenedorPantalla } from '@/shared/components/contenedor-pantalla/ContenedorPantalla';

import Field from '../../../../components/Field';

type LoginForm = {
  email: string;
  password: string;
};

export function IniciarSesionScreen() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const { control, handleSubmit } = useForm<LoginForm>({
    defaultValues: { email: '', password: '' },
  });

  const enviar = handleSubmit(async (datos) => {
    setError(null);
    setEnviando(true);
    try {
      await login(datos.email, datos.password);
      router.push('/perfil');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
    } finally {
      setEnviando(false);
    }
  });

  return (
    <ContenedorPantalla titulo="Iniciar sesión">
      <Text className="mt-3 text-base text-texto/70">Entra con el correo que registraste.</Text>

      <View className="mt-8 gap-4">
        <Field
          control={control}
          name="email"
          label="Correo"
          placeholder="tu@email.com"
          keyboardType="email-address"
          rules={{ required: 'Escribe tu correo' }}
        />
        <Field
          control={control}
          name="password"
          label="Contraseña"
          placeholder="Contraseña"
          secureTextEntry
          rules={{ required: 'Escribe tu contraseña' }}
        />
      </View>

      {error ? <Text className="mt-4 text-sm text-red-600">{error}</Text> : null}

      <Pressable onPress={enviar} disabled={enviando} className="mt-8 bg-marca-oscura py-4">
        <Text className="text-center text-[11px] tracking-[3px] text-crema">
          {enviando ? 'ENTRANDO...' : 'ENTRAR'}
        </Text>
      </Pressable>

      <Pressable onPress={() => router.push('/registro')} className="mt-5 py-2">
        <Text className="text-center text-sm text-marca">No tengo cuenta. Registrarme</Text>
      </Pressable>
    </ContenedorPantalla>
  );
}
