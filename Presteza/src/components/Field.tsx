/**
 * Campo de texto conectado a react-hook-form.
 *
 * `Controller` es el puente entre el formulario y un input de React Native:
 * le entrega el valor actual y recibe los cambios. Gracias a eso la pantalla
 * no necesita un `useState` por cada campo.
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from 'react-hook-form';
import { Platform, Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';

import { useVerContrasena } from '@/shared/hooks/useVerContrasena';

// Hereda todas las props de TextInput (keyboardType, secureTextEntry...) y
// añade las del formulario.
type Props<T extends FieldValues> = TextInputProps & {
  control: Control<T>;
  /** Nombre del campo dentro del formulario. TypeScript solo acepta los que existen. */
  name: Path<T>;
  label: string;
  /** Reglas de validación: required, minLength, pattern, validate... */
  rules?: RegisterOptions<T, Path<T>>;
};

export default function Field<T extends FieldValues>({
  control,
  name,
  label,
  rules,
  className,
  secureTextEntry,
  ...input
}: Props<T>) {
  const contrasena = useVerContrasena(secureTextEntry);

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View className="gap-1.5">
          <Text className="font-roboto-semibold text-marca-oscura">{label}</Text>
          <View className="relative justify-center">
            <TextInput
              // Android no refresca los puntos al quitar `secureTextEntry` si
              // el mismo input sigue montado; la `key` fuerza el remount.
              key={
                Platform.OS === 'android' && contrasena.esContrasena
                  ? String(contrasena.oculto)
                  : undefined
              }
              // El `className` que llegue desde fuera se suma al de aquí; si se
              // pasara dentro de `...input` reemplazaría estos estilos base.
              className={`border bg-white p-3.5 font-roboto ${
                error ? 'border-red-600' : 'border-linea'
              } ${contrasena.esContrasena ? 'pr-12' : ''} ${className ?? ''}`}
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="none"
              placeholderTextColor="#a3a3a3"
              {...input}
              secureTextEntry={contrasena.oculto}
            />
            {contrasena.esContrasena ? (
              <Pressable
                onPress={contrasena.alternar}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={contrasena.etiqueta}
                className="absolute right-0 top-0 z-10 h-full w-12 items-center justify-center">
                <Ionicons name={contrasena.icono} size={20} color="#6b1d3d" />
              </Pressable>
            ) : null}
          </View>
          {/* El mensaje sale de las `rules`: quien define la regla define el texto. */}
          {!!error && <Text className="font-roboto text-xs text-red-600">{error.message}</Text>}
        </View>
      )}
    />
  );
}
