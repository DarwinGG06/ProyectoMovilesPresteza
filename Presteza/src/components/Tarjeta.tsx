import React, { type ReactNode } from 'react';
import { View } from 'react-native';

/** Bloque sobre pergamino: solo una línea, sin caja blanca. */
export default function Tarjeta({ children, className }: { children: ReactNode; className?: string }) {
  return <View className={`border-b border-madera/15 py-5 ${className ?? ''}`}>{children}</View>;
}
