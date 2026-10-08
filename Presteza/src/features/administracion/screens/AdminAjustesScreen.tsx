import { PantallaPestanaAdmin } from '../components/PantallaPestanaAdmin';
import { TabAjustes } from '../components/tabs/TabAjustes';
import { useAdminContext } from '../context/AdminContext';

export function AdminAjustesScreen() {
  const admin = useAdminContext();

  if (!admin.user) return null;

  return (
    <PantallaPestanaAdmin>
      <TabAjustes
        user={admin.user}
        guardando={admin.guardando}
        onGuardar={admin.guardarAjustes}
        onSalir={admin.salir}
      />
    </PantallaPestanaAdmin>
  );
}
