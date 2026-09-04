import { type ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Footer } from '@/shared/components/footer';

type ContenedorPantallaProps = {
  titulo: string;
  children?: ReactNode;
};

export function ContenedorPantalla({ titulo, children }: ContenedorPantallaProps) {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView>
        <View className="px-6 py-10">
          <Text className="text-2xl font-bold text-texto">{titulo}</Text>
          {children}
        </View>
        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
}
