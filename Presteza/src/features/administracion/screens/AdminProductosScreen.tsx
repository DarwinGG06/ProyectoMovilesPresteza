import { PantallaPestanaAdmin } from '../components/PantallaPestanaAdmin';
import { TabProductos } from '../components/tabs/TabProductos';
import { useAdminContext } from '../context/AdminContext';

export function AdminProductosScreen() {
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
