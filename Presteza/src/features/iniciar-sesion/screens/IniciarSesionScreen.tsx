import { Link } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

import Button from '@/components/Button';
import Field from '@/components/Field';
import MensajeError from '@/components/MensajeError';
import { ContenedorPantalla } from '@/shared/components/contenedor-pantalla/ContenedorPantalla';

import { useIniciarSesion } from '../hooks/useIniciarSesion';

export function IniciarSesionScreen() {
  const { control, error, enviando, entrar } = useIniciarSesion();

  return (
    <ContenedorPantalla titulo="Iniciar sesión">
      <Text className="mt-3 font-roboto text-base text-texto/70">
        Entra con el correo que registraste.
      </Text>

      <View className="mt-8 gap-5">
        <Field
          control={control}
          name="email"
          label="Correo"
          keyboardType="email-address"
          placeholder="tu@email.com"
          maxLength={120}
          rules={{
            required: 'El correo es obligatorio',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Correo inválido' },
            maxLength: { value: 120, message: 'Máximo 120 caracteres' },
          }}
        />
        <Field
          control={control}
          name="password"
          label="Contraseña"
          secureTextEntry
          placeholder="••••••••"
          maxLength={72}
          rules={{
            required: 'La contraseña es obligatoria',
            maxLength: { value: 72, message: 'Máximo 72 caracteres' },
          }}
        />

        <MensajeError texto={error} />

        <Button text={enviando ? 'ENTRANDO…' : 'ENTRAR'} onPress={entrar} disabled={enviando} />

        <Link href="/recuperar-contrasena" className="text-center text-sm text-marca">
          ¿Olvidaste tu contraseña?
        </Link>
        <Link href="/registro" className="text-center text-sm text-marca">
          ¿No tienes cuenta? Regístrate
        </Link>
      </View>
    </ContenedorPantalla>
  );
}
