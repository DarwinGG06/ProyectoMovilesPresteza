import { PantallaPestanaAdmin } from '@/features/administracion/components/PantallaPestanaAdmin';
import { TabInventario } from '@/features/administracion/components/tabs/TabInventario';
import { useAdminContext } from '@/features/administracion/context/AdminContext';

export default function AdminInventarioRoute() {
  const admin = useAdminContext();

  return (
    <PantallaPestanaAdmin>
      <TabInventario
        insumos={admin.insumos}
        guardando={admin.guardando}
        onGuardar={admin.guardarInsumo}
        onEliminar={admin.eliminarInsumo}
      />
    </PantallaPestanaAdmin>
  );
}
