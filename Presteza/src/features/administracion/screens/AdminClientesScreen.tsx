import { PantallaPestanaAdmin } from '../components/PantallaPestanaAdmin';
import { TabClientes } from '../components/tabs/TabClientes';
import { useAdminContext } from '../context/AdminContext';

export function AdminClientesScreen() {
  const admin = useAdminContext();

  return (
    <PantallaPestanaAdmin>
      <TabClientes
        clientes={admin.clientes}
        guardando={admin.guardando}
        onGuardar={admin.guardarCliente}
        onEliminar={admin.eliminarCliente}
      />
    </PantallaPestanaAdmin>
  );
}
