import { PantallaPestanaAdmin } from '../components/PantallaPestanaAdmin';
import { TabReservas } from '../components/tabs/TabReservas';
import { useAdminContext } from '../context/AdminContext';

export function AdminReservasScreen() {
  const admin = useAdminContext();

  return (
    <PantallaPestanaAdmin>
      <TabReservas reservas={admin.casaReservas} />
    </PantallaPestanaAdmin>
  );
}
