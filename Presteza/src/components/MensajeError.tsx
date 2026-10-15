import React from 'react';
import { Text } from 'react-native';

/** Error del formulario o del servidor, visible en pantalla (no en consola). */
export default function MensajeError({ texto, className }: { texto?: string; className?: string }) {
  if (!texto) return null;
  return (
    <Text className={`bg-red-50 p-3 text-center font-roboto text-red-700 ${className ?? ''}`}>
      {texto}
    </Text>
  );
}
