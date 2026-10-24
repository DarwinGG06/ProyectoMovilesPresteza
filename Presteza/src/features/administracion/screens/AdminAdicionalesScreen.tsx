import { PantallaPestanaAdmin } from '../components/PantallaPestanaAdmin';
import { TabAdicionales } from '../components/tabs/TabAdicionales';
import { useAdminContext } from '../context/AdminContext';

export function AdminAdicionalesScreen() {
  const admin = useAdminContext();

  return (
    <PantallaPestanaAdmin>
      <TabAdicionales
        adicionales={admin.adicionales}
        categorias={admin.categorias}
        guardando={admin.guardando}
        onGuardar={admin.guardarAdicional}
        onAlternar={admin.alternarAdicional}
        onEliminar={admin.eliminarAdicional}
      />
    </PantallaPestanaAdmin>
  );
}
