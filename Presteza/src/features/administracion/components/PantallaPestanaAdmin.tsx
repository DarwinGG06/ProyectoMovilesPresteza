import { type ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { EvitarTeclado } from '@/shared/components/evitar-teclado/EvitarTeclado';
import { Footer } from '@/shared/components/footer';

import { useAdminContext } from '../context/AdminContext';
import { BarraTabsAdmin } from './BarraTabsAdmin';
import { HeroAdmin } from './HeroAdmin';

type PantallaPestanaAdminProps = {
  children: ReactNode;
};

export function PantallaPestanaAdmin({ children }: PantallaPestanaAdminProps) {
  const { error, user, stats } = useAdminContext();

  return (
    <EvitarTeclado>
      <ScrollView
        style={{ flex: 1 }}
        className="bg-marca-oscura"
        contentContainerClassName="grow-0"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag">
        {user ? <HeroAdmin nombre={user.name} stats={stats} /> : null}
        <BarraTabsAdmin />
        <View className="px-5 pb-10 pt-6">
          {error ? <Text className="mb-4 text-sm text-red-300">{error}</Text> : null}
          {children}
        </View>
        <Footer />
      </ScrollView>
    </EvitarTeclado>
  );
}
