import { type ReactNode } from 'react';
import { Text, View } from 'react-native';
import { router, usePathname } from 'expo-router';

import { useAdminContext } from '../context/AdminContext';
import { hrefAdmin, PESTANA_POR_RUTA } from '../rutas';
import type { PestanaAdmin } from '../types';
import { EncabezadoSeccionAdmin } from './PestanasAdmin';

type MarcoAdminProps = {
  children: ReactNode;
};

export function MarcoAdmin({ children }: MarcoAdminProps) {
  const { error, stats } = useAdminContext();
  const pathname = usePathname();
  const ultimo = pathname.split('/').filter(Boolean).pop() ?? 'admin';
  const activa: PestanaAdmin = ultimo === 'admin' ? 'dashboard' : (PESTANA_POR_RUTA[ultimo] ?? 'dashboard');
  const enCasa = activa === 'dashboard';

  return (
    <View className="flex-1 bg-crema">
      {!enCasa ? (
        <EncabezadoSeccionAdmin
          pestana={activa as Exclude<PestanaAdmin, 'dashboard'>}
          onVolver={() => router.replace(hrefAdmin('dashboard'))}
          onChange={(id) => {
            if (id === activa) return;
            router.replace(hrefAdmin(id));
          }}
          contadores={{
            pedidos: stats.pendingOrders,
            reservas: stats.pendingReservations,
            mensajes: stats.unreadMessages,
          }}
        />
      ) : null}
      {error ? (
        <Text className="px-6 pt-2 font-roboto text-sm text-red-600">{error}</Text>
      ) : null}
      <View className="flex-1">{children}</View>
    </View>
  );
}
