import { PantallaPestanaAdmin } from '@/features/administracion/components/PantallaPestanaAdmin';
import { TabAdicionales } from '@/features/administracion/components/tabs/TabAdicionales';
import { useAdminContext } from '@/features/administracion/context/AdminContext';

export default function AdminAdicionalesRoute() {
  const admin = useAdminContext();

  return (
    <PantallaPestanaAdmin>
      <TabAdicionales
        adicionales={admin.adicionales}
        guardando={admin.guardando}
        onGuardar={admin.guardarAdicional}
        onAlternar={admin.alternarAdicional}
        onEliminar={admin.eliminarAdicional}
      />
    </PantallaPestanaAdmin>
  );
}
