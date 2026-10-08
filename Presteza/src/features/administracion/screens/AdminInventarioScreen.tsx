import { PantallaPestanaAdmin } from '../components/PantallaPestanaAdmin';
import { TabInventario } from '../components/tabs/TabInventario';
import { useAdminContext } from '../context/AdminContext';

export function AdminInventarioScreen() {
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
