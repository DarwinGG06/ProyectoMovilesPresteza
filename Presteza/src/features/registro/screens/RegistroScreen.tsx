import { Link } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

import Button from '@/components/Button';
import CampoFecha from '@/components/CampoFecha';
import Field from '@/components/Field';
import MensajeError from '@/components/MensajeError';
import { ContenedorPantalla } from '@/shared/components/contenedor-pantalla/ContenedorPantalla';
import { reglasContrasena, reglasTelefono, requisitosContrasena } from '@/shared/validacion';

import { useRegistro } from '../hooks/useRegistro';

export function RegistroScreen() {
  const { control, password, error, enviando, crearCuenta, validarConfirmacion } = useRegistro();
  const requisitos = requisitosContrasena(password);

  return (
    <ContenedorPantalla titulo="Registro">
      <Text className="mt-4 font-roboto text-base leading-6 text-tinta/70">
        Crea tu cuenta. La fecha de nacimiento sirve para el 15% de cumpleaños; debes tener al menos
        15 años.
      </Text>

      <View className="mt-10 gap-6">
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
          maxLength={10}
          rules={reglasTelefono}
        />
        <CampoFecha control={control} name="birthDate" label="Fecha de nacimiento" />
        <View>
          <Field
            control={control}
            name="password"
            label="Contraseña"
            secureTextEntry
            placeholder="Ej: Presteza1"
            maxLength={72}
            rules={reglasContrasena}
          />
          <View className="mt-2 gap-1">
            {requisitos.map((r) => (
              <Text
                key={r.texto}
                className={`font-roboto text-[12px] leading-5 ${r.ok ? 'text-marca' : 'text-tinta/45'}`}
              >
                {r.ok ? '✓' : '○'} {r.texto}
              </Text>
            ))}
          </View>
        </View>
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
          className="mt-2"
          variant="gold"
          text={enviando ? 'CREANDO…' : 'CREAR CUENTA'}
          onPress={crearCuenta}
          disabled={enviando}
        />

        <View className="mt-4 items-center">
          <View className="mb-4 h-px w-10 bg-marca/25" />
          <Link href="/iniciar-sesion">
            <Text className="text-center font-roboto text-sm text-tinta/70">
              ¿Ya tienes cuenta? <Text className="font-roboto text-marca">Inicia sesión</Text>
            </Text>
          </Link>
        </View>
      </View>
    </ContenedorPantalla>
  );
}
