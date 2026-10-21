import React, { type ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { EvitarTeclado } from '@/shared/components/evitar-teclado/EvitarTeclado';
import { Footer } from '@/shared/components/footer';
import { Pergamino } from '@/shared/components/materiales/Pergamino';

export default function Pantalla({ titulo, children }: { titulo: string; children?: ReactNode }) {
  return (
    <EvitarTeclado>
      <Pergamino fill>
        <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
          <View className="px-7 pb-16 pt-10">
            <Text className="font-roboto text-[10px] tracking-[4px] text-marca">PRESTEZA</Text>
            <Text className="mt-2 font-serif-light text-[40px] leading-tight text-tinta">
              {titulo}
            </Text>
            <View className="mt-4 h-px w-10 bg-marca/30" />
            {children}
          </View>
          <Footer />
        </ScrollView>
      </Pergamino>
    </EvitarTeclado>
  );
}

export { Pantalla as ContenedorPantalla };
