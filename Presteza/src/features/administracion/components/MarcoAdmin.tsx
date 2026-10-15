import { type ReactNode } from 'react';
import { Text, View } from 'react-native';

import { useAdminContext } from '../context/AdminContext';
import { BarraTabsAdmin } from './BarraTabsAdmin';
import { HeroAdmin } from './HeroAdmin';

type MarcoAdminProps = {
  children: ReactNode;
};

export function MarcoAdmin({ children }: MarcoAdminProps) {
  const { error, user, stats } = useAdminContext();

  return (
    <View className="flex-1 bg-marca-oscura">
      {user ? <HeroAdmin nombre={user.name} stats={stats} /> : null}
      <BarraTabsAdmin />
      {error ? (
        <Text className="px-5 pt-3 font-roboto text-sm text-red-300">{error}</Text>
      ) : null}
      <View className="flex-1">{children}</View>
    </View>
  );
}
