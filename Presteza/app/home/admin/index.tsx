import { PantallaPestanaAdmin } from '@/features/administracion/components/PantallaPestanaAdmin';
import { TabDashboard } from '@/features/administracion/components/tabs/TabDashboard';
import { useAdminContext } from '@/features/administracion/context/AdminContext';

export default function AdminResumenRoute() {
  const admin = useAdminContext();

  return (
    <PantallaPestanaAdmin>
      <TabDashboard stats={admin.stats} pedidos={admin.pedidos} />
    </PantallaPestanaAdmin>
  );
}
