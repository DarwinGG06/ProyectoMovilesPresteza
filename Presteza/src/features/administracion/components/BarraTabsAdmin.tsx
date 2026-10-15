import { router, usePathname } from 'expo-router';

import { useAdminContext } from '@/features/administracion/context/AdminContext';
import { hrefAdmin, PESTANA_POR_RUTA } from '@/features/administracion/rutas';
import type { PestanaAdmin } from '@/features/administracion/types';

import { PestanasAdmin } from './PestanasAdmin';

export function BarraTabsAdmin() {
  const admin = useAdminContext();
  const pathname = usePathname();
  const ultimo = pathname.split('/').filter(Boolean).pop() ?? 'admin';
  const activa: PestanaAdmin = ultimo === 'admin' ? 'dashboard' : (PESTANA_POR_RUTA[ultimo] ?? 'dashboard');

  return (
    <PestanasAdmin
      activa={activa}
      onChange={(id) => {
        if (id === activa) return;
        router.replace(hrefAdmin(id));
      }}
      contadores={{
        pedidos: admin.stats.pendingOrders,
        categorias: admin.stats.totalCategorias,
        inventario: admin.stats.totalInsumos,
        adicionales: admin.stats.totalAdicionales,
        clientes: admin.stats.totalCustomers,
      }}
    />
  );
}
