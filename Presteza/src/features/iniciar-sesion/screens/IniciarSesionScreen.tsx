import { Link } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

import Button from '@/components/Button';
import Field from '@/components/Field';
import MensajeError from '@/components/MensajeError';
import { BiometricLoginButton } from '@/session/BiometricLoginButton';
import { ContenedorPantalla } from '@/shared/components/contenedor-pantalla/ContenedorPantalla';

import { useIniciarSesion } from '../hooks/useIniciarSesion';

export function IniciarSesionScreen() {
  const {
    control,
    error,
    enviando,
    entrar,
    entrarConBiometria,
    biometricSupport,
    biometricBusy,
    biometricEnabled,
  } = useIniciarSesion();

  return (
    <ContenedorPantalla titulo="Iniciar sesión">
      <Text className="mt-4 font-roboto text-base leading-6 text-tinta/55">
        Entra con el correo que registraste.
      </Text>

      <View className="mt-8 gap-5">
        <Field
          control={control}
          name="email"
          label="Correo"
          keyboardType="email-address"
          // Autocompletar: Android (Google / gestor de contraseñas) y iOS (Llavero)
          // reconocen este campo como el usuario de la cuenta.
          autoComplete="email"
          textContentType="username"
          importantForAutofill="yes"
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
          autoComplete="current-password"
          textContentType="password"
          importantForAutofill="yes"
          placeholder="••••••••"
          maxLength={72}
          rules={{
            required: 'La contraseña es obligatoria',
            maxLength: { value: 72, message: 'Máximo 72 caracteres' },
          }}
        />

        <MensajeError texto={error} />

        <Button
          className="mt-2"
          variant="gold"
          text={enviando ? 'ENTRANDO…' : 'ENTRAR'}
          onPress={entrar}
          disabled={enviando}
        />
        <BiometricLoginButton
          label={biometricSupport.label}
          busy={biometricBusy}
          disabled={enviando}
          onPress={() => void entrarConBiometria()}
          showHint={!biometricEnabled}
        />

        <View className="mt-4 items-center gap-3">
          <View className="mb-1 h-px w-10 bg-marca/25" />
          <Link href="/recuperar-contrasena">
            <Text className="text-center font-roboto text-sm text-marca">
              ¿Olvidaste tu contraseña?
            </Text>
          </Link>
          <Link href="/registro">
            <Text className="text-center font-roboto text-sm text-tinta/50">
              ¿No tienes cuenta? <Text className="font-roboto text-marca">Regístrate</Text>
            </Text>
          </Link>
        </View>
      </View>
    </ContenedorPantalla>
  );
}
