import { PantallaPestanaAdmin } from '@/features/administracion/components/PantallaPestanaAdmin';
import { TabCategorias } from '@/features/administracion/components/tabs/TabCategorias';
import { useAdminContext } from '@/features/administracion/context/AdminContext';

export default function AdminCategoriasRoute() {
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
