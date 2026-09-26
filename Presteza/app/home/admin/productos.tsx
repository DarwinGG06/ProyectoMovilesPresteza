import { PantallaPestanaAdmin } from '@/features/administracion/components/PantallaPestanaAdmin';
import { TabProductos } from '@/features/administracion/components/tabs/TabProductos';
import { useAdminContext } from '@/features/administracion/context/AdminContext';

export default function AdminProductosRoute() {
  const admin = useAdminContext();

  return (
    <PantallaPestanaAdmin>
      <TabProductos
        productos={admin.productos}
        categorias={admin.categorias}
        guardando={admin.guardando}
        onGuardar={admin.guardarProducto}
        onAlternar={admin.alternarProducto}
        onEliminar={admin.eliminarProducto}
      />
    </PantallaPestanaAdmin>
  );
}
