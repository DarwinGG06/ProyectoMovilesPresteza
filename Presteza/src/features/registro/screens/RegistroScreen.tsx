import { router } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';

import { useAuth } from '@/auth/AuthContext';
import { ContenedorPantalla } from '@/shared/components/contenedor-pantalla/ContenedorPantalla';

import Field from '../../../../components/Field';

type RegistroForm = {
  complete_name: string;
  email: string;
  phone_number: string;
  password: string;
  confirmar: string;
};

export function RegistroScreen() {
  const { register } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const { control, handleSubmit, getValues } = useForm<RegistroForm>({
    defaultValues: {
      complete_name: '',
      email: '',
      phone_number: '',
      password: '',
      confirmar: '',
    },
  });

  const enviar = handleSubmit(async (datos) => {
    setError(null);
    setEnviando(true);
    try {
      await register({
        complete_name: datos.complete_name,
        email: datos.email,
        phone_number: datos.phone_number,
        password: datos.password,
      });
      router.push('/perfil');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar.');
    } finally {
      setEnviando(false);
    }
  });

  return (
    <ContenedorPantalla titulo="Registro">
      <Text className="mt-3 text-base text-texto/70">
        Crea tu cuenta. Se guarda en Presteza (nombre, correo y teléfono).
      </Text>

      <View className="mt-8 gap-4">
        <Field
          control={control}
          name="complete_name"
          label="Nombre completo"
          placeholder="Ej: Ana Pérez"
          autoCapitalize="words"
          rules={{ required: 'Escribe tu nombre' }}
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
          rules={{ required: 'Escribe tu teléfono' }}
        />
        <Field
          control={control}
          name="password"
          label="Contraseña"
          placeholder="Ej: Presteza1"
          secureTextEntry
          rules={{
            required: 'Escribe una contraseña',
            minLength: { value: 8, message: 'Mínimo 8 caracteres' },
            pattern: {
              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
              message: 'Usa mayúscula, minúscula y un número',
            },
          }}
        />
        <Field
          control={control}
          name="confirmar"
          label="Confirmar contraseña"
          placeholder="Repite la contraseña"
          secureTextEntry
          rules={{
            required: 'Confirma la contraseña',
            validate: (valor) => valor === getValues('password') || 'Las contraseñas no coinciden',
          }}
        />
      </View>

      {error ? <Text className="mt-4 text-sm text-red-600">{error}</Text> : null}

      <Pressable onPress={enviar} disabled={enviando} className="mt-8 bg-marca-oscura py-4">
        <Text className="text-center text-[11px] tracking-[3px] text-crema">
          {enviando ? 'GUARDANDO...' : 'CREAR CUENTA'}
        </Text>
      </Pressable>

      <Pressable onPress={() => router.push('/iniciar-sesion')} className="mt-5 py-2">
        <Text className="text-center text-sm text-marca">Ya tengo cuenta. Iniciar sesión</Text>
      </Pressable>
    </ContenedorPantalla>
  );
}
