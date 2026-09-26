import { PantallaPestanaAdmin } from '@/features/administracion/components/PantallaPestanaAdmin';
import { TabClientes } from '@/features/administracion/components/tabs/TabClientes';
import { useAdminContext } from '@/features/administracion/context/AdminContext';

export default function AdminClientesRoute() {
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
