import { PantallaPestanaAdmin } from '../components/PantallaPestanaAdmin';
import { TabMensajes } from '../components/tabs/TabMensajes';
import { useAdminContext } from '../context/AdminContext';

export function AdminMensajesScreen() {
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
