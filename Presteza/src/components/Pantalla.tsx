import React, { type ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';

import Badge from '@/components/Badge';
import { EvitarTeclado } from '@/shared/components/evitar-teclado/EvitarTeclado';
import { Footer } from '@/shared/components/footer';

/**
 * Contenedor de pantalla (fondo crema, sello, título).
 * Las clases viven aquí para no copiarlas en cada ruta de `app/`.
 */
export default function Pantalla({ titulo, children }: { titulo: string; children?: ReactNode }) {
  return (
    <EvitarTeclado>
      <View className="flex-1 bg-crema">
        <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
          <View className="px-6 pb-12 pt-8">
            <View className="mb-3 h-px w-12 bg-oro" />
            <Badge text="PRESTEZA" variant="sello" />
            <Text className="mt-1 font-roboto-extrabold text-4xl leading-tight text-marca-oscura">
              {titulo}
            </Text>
            {children}
          </View>
          <Footer />
        </ScrollView>
      </View>
    </EvitarTeclado>
  );
}

export { Pantalla as ContenedorPantalla };
