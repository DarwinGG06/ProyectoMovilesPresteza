import { Link } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

import Button from '@/components/Button';
import CampoFecha from '@/components/CampoFecha';
import Field from '@/components/Field';
import MensajeError from '@/components/MensajeError';
import { ContenedorPantalla } from '@/shared/components/contenedor-pantalla/ContenedorPantalla';

import { useRegistro } from '../hooks/useRegistro';

export function RegistroScreen() {
  const { control, error, enviando, crearCuenta, validarConfirmacion } = useRegistro();

  return (
    <ContenedorPantalla titulo="Registro">
      <Text className="mt-3 font-roboto text-base text-texto/70">
        Crea tu cuenta. La fecha de nacimiento sirve para el 15% de cumpleaños; debes tener al menos
        15 años.
      </Text>

      <View className="mt-8 gap-5">
        <Field
          control={control}
          name="name"
          label="Nombre completo"
          autoCapitalize="words"
          placeholder="Ana María Restrepo"
          maxLength={80}
          rules={{
            required: 'El nombre es obligatorio',
            minLength: { value: 2, message: 'Mínimo 2 caracteres' },
            maxLength: { value: 80, message: 'Máximo 80 caracteres' },
          }}
        />
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
          name="phone"
          label="Teléfono"
          keyboardType="phone-pad"
          placeholder="3104941839"
          maxLength={20}
          rules={{
            required: 'El teléfono es obligatorio',
            maxLength: { value: 20, message: 'Máximo 20 caracteres' },
          }}
        />
        <CampoFecha control={control} name="birthDate" label="Fecha de nacimiento" />
        <Field
          control={control}
          name="password"
          label="Contraseña"
          secureTextEntry
          placeholder="••••••••"
          maxLength={72}
          rules={{
            required: 'La contraseña es obligatoria',
            minLength: { value: 8, message: 'Mínimo 8 caracteres' },
            maxLength: { value: 72, message: 'Máximo 72 caracteres' },
          }}
        />
        <Field
          control={control}
          name="confirmation"
          label="Confirmar contraseña"
          secureTextEntry
          placeholder="••••••••"
          rules={{
            required: 'Confirma la contraseña',
            validate: validarConfirmacion,
          }}
        />

        <MensajeError texto={error} />

        <Button
          text={enviando ? 'CREANDO…' : 'CREAR CUENTA'}
          onPress={crearCuenta}
          disabled={enviando}
        />

        <Link href="/iniciar-sesion" className="text-center text-sm text-marca">
          ¿Ya tienes cuenta? Inicia sesión
        </Link>
      </View>
    </ContenedorPantalla>
  );
}
