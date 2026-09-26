import { PantallaPestanaAdmin } from '@/features/administracion/components/PantallaPestanaAdmin';
import { TabMensajes } from '@/features/administracion/components/tabs/TabMensajes';
import { useAdminContext } from '@/features/administracion/context/AdminContext';

export default function AdminMensajesRoute() {
  const admin = useAdminContext();

  return (
    <PantallaPestanaAdmin>
      <TabMensajes
        mensajes={admin.mensajes}
        guardando={admin.guardando}
        onGuardar={admin.guardarMensaje}
        onEliminar={admin.eliminarMensaje}
      />
    </PantallaPestanaAdmin>
  );
}
