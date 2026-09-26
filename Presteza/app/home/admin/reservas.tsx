import { PantallaPestanaAdmin } from '@/features/administracion/components/PantallaPestanaAdmin';
import { TabReservas } from '@/features/administracion/components/tabs/TabReservas';
import { useAdminContext } from '@/features/administracion/context/AdminContext';

export default function AdminReservasRoute() {
  const admin = useAdminContext();

  return (
    <PantallaPestanaAdmin>
      <TabReservas reservas={admin.casaReservas} />
    </PantallaPestanaAdmin>
  );
}
