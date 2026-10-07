import { PantallaPestanaAdmin } from '../components/PantallaPestanaAdmin';
import { TabCategorias } from '../components/tabs/TabCategorias';
import { useAdminContext } from '../context/AdminContext';

export function AdminCategoriasScreen() {
  const admin = useAdminContext();

  return (
    <PantallaPestanaAdmin>
      <TabCategorias
        categorias={admin.categorias}
        guardando={admin.guardando}
        onGuardar={admin.guardarCategoria}
        onEliminar={admin.eliminarCategoria}
      />
    </PantallaPestanaAdmin>
  );
}
