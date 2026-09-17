import React from 'react';
import { TextInput } from 'react-native';

type Props = {
  value: string;
  onChangeText: (texto: string) => void;
  placeholder?: string;
  /** `oscuro` = listas admin sobre marca. `claro` = pantallas crema. */
  variant?: 'claro' | 'oscuro';
  className?: string;
};

export default function CampoBusqueda({
  value,
  onChangeText,
  placeholder = 'Buscar...',
  variant = 'claro',
  className,
}: Props) {
  const clases =
    variant === 'oscuro'
      ? 'mb-4 border-b border-oro/30 py-3 text-crema'
      : 'border border-linea bg-white px-4 py-3 text-texto';

  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={variant === 'oscuro' ? '#d4af7788' : '#a3a3a3'}
      autoCapitalize="none"
      className={`${clases} ${className ?? ''}`}
    />
  );
}
