import { type ReactNode } from 'react';
import { ScrollView, View } from 'react-native';

import { EvitarTeclado } from '@/shared/components/evitar-teclado/EvitarTeclado';
import { Footer } from '@/shared/components/footer';

type PantallaPestanaAdminProps = {
  children: ReactNode;
};

export function PantallaPestanaAdmin({ children }: PantallaPestanaAdminProps) {
  return (
    <EvitarTeclado>
      <ScrollView
        style={{ flex: 1 }}
        className="bg-marca-oscura"
        contentContainerClassName="grow-0"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag">
        <View className="px-5 pb-24 pt-6">{children}</View>
        <Footer />
      </ScrollView>
    </EvitarTeclado>
  );
}
