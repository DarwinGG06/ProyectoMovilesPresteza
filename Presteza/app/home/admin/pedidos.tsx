import { PantallaPestanaAdmin } from '@/features/administracion/components/PantallaPestanaAdmin';
import { TabPedidos } from '@/features/administracion/components/tabs/TabPedidos';
import { useAdminContext } from '@/features/administracion/context/AdminContext';

export default function AdminPedidosRoute() {
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
