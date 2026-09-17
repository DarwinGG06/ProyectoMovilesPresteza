import React, { type ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';

import Badge from '@/components/Badge';
import { Footer } from '@/shared/components/footer';

/**
 * Contenedor de pantalla (fondo crema, sello, título).
 * Las clases viven aquí para no copiarlas en cada ruta de `app/`.
 */
export default function Pantalla({ titulo, children }: { titulo: string; children?: ReactNode }) {
  return (
    <View className="flex-1 bg-crema">
      <ScrollView>
        <View className="px-6 pb-12 pt-8">
          <View className="mb-3 h-px w-12 bg-oro" />
          <Badge text="PRESTEZA" variant="sello" />
          <Text className="mt-1 text-4xl font-extrabold leading-tight text-marca-oscura">{titulo}</Text>
          {children}
        </View>
        <Footer />
      </ScrollView>
    </View>
  );
}

export { Pantalla as ContenedorPantalla };
