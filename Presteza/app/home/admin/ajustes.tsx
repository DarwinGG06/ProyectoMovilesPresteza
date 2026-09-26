import { PantallaPestanaAdmin } from '@/features/administracion/components/PantallaPestanaAdmin';
import { TabAjustes } from '@/features/administracion/components/tabs/TabAjustes';
import { useAdminContext } from '@/features/administracion/context/AdminContext';

export default function AdminAjustesRoute() {
  const admin = useAdminContext();

  if (!admin.user) return null;

  return (
    <PantallaPestanaAdmin>
      <TabAjustes user={admin.user} guardando={admin.guardando} onGuardar={admin.guardarAjustes} onSalir={admin.salir} />
    </PantallaPestanaAdmin>
  );
}
