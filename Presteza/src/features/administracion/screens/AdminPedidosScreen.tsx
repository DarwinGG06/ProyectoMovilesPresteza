import { PantallaPestanaAdmin } from '../components/PantallaPestanaAdmin';
import { TabPedidos } from '../components/tabs/TabPedidos';
import { useAdminContext } from '../context/AdminContext';

export function AdminPedidosScreen() {
  const admin = useAdminContext();

  return (
    <PantallaPestanaAdmin>
      <TabPedidos
        pedidos={admin.pedidos}
        clientes={admin.clientes}
        productos={admin.productos}
        guardando={admin.guardando}
        onGuardar={admin.guardarPedido}
        onCambiarEstado={admin.cambiarEstadoPedido}
        onEliminar={admin.eliminarPedido}
      />
    </PantallaPestanaAdmin>
  );
}
