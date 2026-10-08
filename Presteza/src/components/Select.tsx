/**
 * Selector de una opción entre varias, en forma de botones.
 *
 * Misma idea que `Field`, pero en vez de un input muestra una fila de opciones
 * donde solo una queda marcada. El recorte es el de Presteza (recto, vino/oro),
 * no un chip redondo genérico.
 */

import React from 'react';
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';

export type SelectValue = string | number | boolean;
export type SelectOption = string | { value: SelectValue; label: string };

function valorDe(option: SelectOption): SelectValue {
  return typeof option === 'string' ? option : option.value;
}

function etiquetaDe(option: SelectOption) {
  return typeof option === 'string' ? option.replace(/_/g, ' ') : option.label;
}

function claveDe(valor: SelectValue) {
  return String(valor);
}

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  options: readonly SelectOption[];
  rules?: RegisterOptions<T, Path<T>>;
};

export default function Select<T extends FieldValues>({
  control,
  name,
  label,
  options,
  rules,
}: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View className="gap-1.5">
          <Text className="font-roboto-semibold text-marca-oscura">{label}</Text>
          <View className="flex-row flex-wrap gap-2">
            {options.map((option) => {
              const opcion = valorDe(option);
              const active = opcion === value;
              return (
                <Pressable
                  key={claveDe(opcion)}
                  onPress={() => onChange(opcion)}
                  className={`px-3 py-2 ${active ? 'bg-marca-oscura' : 'border border-marca/20'}`}>
                  <Text
                    className={`font-roboto text-[12px] ${active ? 'text-crema' : 'text-marca-oscura'}`}>
                    {etiquetaDe(option)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {!!error && <Text className="font-roboto text-xs text-red-600">{error.message}</Text>}
        </View>
      )}
    />
  );
}
