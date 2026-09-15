import React, { type ReactNode } from 'react';
import { View } from 'react-native';

/** Tarjeta de lista / bloque de contenido. Se extrae porque el borde+fondo se repetía. */
export default function Tarjeta({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <View className={`border border-linea bg-white p-5 ${className ?? ''}`}>{children}</View>
  );
}
