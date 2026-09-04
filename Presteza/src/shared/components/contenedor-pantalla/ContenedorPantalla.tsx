import { type ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Footer } from '@/shared/components/footer';

type ContenedorPantallaProps = {
  titulo: string;
  children?: ReactNode;
};

export function ContenedorPantalla({ titulo, children }: ContenedorPantallaProps) {
  return (
    <View className="flex-1 bg-crema">
      <ScrollView>
        <View className="px-6 pb-12 pt-8">
          <View className="mb-3 h-px w-12 bg-oro" />
          <Text className="text-[11px] tracking-[3px] text-oro">PRESTEZA</Text>
          <Text className="mt-1 text-4xl font-extrabold leading-tight text-marca-oscura">{titulo}</Text>
          {children}
        </View>
        <Footer />
      </ScrollView>
    </View>
  );
}
