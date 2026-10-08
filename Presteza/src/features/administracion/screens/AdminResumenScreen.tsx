import { PantallaPestanaAdmin } from '../components/PantallaPestanaAdmin';
import { TabDashboard } from '../components/tabs/TabDashboard';
import { useAdminContext } from '../context/AdminContext';

export function AdminResumenScreen() {
  const admin = useAdminContext();

  return (
    <PantallaPestanaAdmin>
      <TabDashboard stats={admin.stats} pedidos={admin.pedidos} />
    </PantallaPestanaAdmin>
  );
}
