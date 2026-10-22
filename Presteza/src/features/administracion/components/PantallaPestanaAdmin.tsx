import { type ReactNode } from 'react';
import { ScrollView, View } from 'react-native';

import { EvitarTeclado } from '@/shared/components/evitar-teclado/EvitarTeclado';

type PantallaPestanaAdminProps = {
  children: ReactNode;
};

export function PantallaPestanaAdmin({ children }: PantallaPestanaAdminProps) {
  return (
    <EvitarTeclado>
      <ScrollView
        style={{ flex: 1 }}
        className="bg-crema"
        contentContainerClassName="grow-0"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag">
        <View className="px-6 pb-16 pt-6">{children}</View>
      </ScrollView>
    </EvitarTeclado>
  );
}
