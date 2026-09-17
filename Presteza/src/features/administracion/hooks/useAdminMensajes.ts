import { useCallback } from 'react';

import { actualizarMensaje, crearMensaje, eliminarMensaje, listarMensajes } from '@/api/admin';
import type { MensajeAdmin, MensajeForm } from '../types';
import { idDe } from '../utils';
import { fusionar, useListaAdmin } from './adminComun';

export function useAdminMensajes() {
  const { lista: mensajes, setLista, cargando, guardando, setGuardando, error, recargar, aviso, conToken } =
    useListaAdmin(listarMensajes);

  const guardar = useCallback(
    async (datos: MensajeForm, editando?: MensajeAdmin | null) => {
      const sesion = conToken();
      if (!sesion) return false;
      const cuerpo = {
        user_name: datos.name.trim(),
        user_email: datos.email.trim().toLowerCase(),
        user_phone: datos.phone.trim(),
        user_title: datos.subject.trim(),
        user_comment: datos.message.trim(),
      };
      const visto = {
        name: cuerpo.user_name,
        email: cuerpo.user_email,
        phone: cuerpo.user_phone,
        subject: cuerpo.user_title,
        message: cuerpo.user_comment,
      };

      setGuardando(true);
      try {
        if (editando) {
          const actualizado = await actualizarMensaje(sesion, idDe(editando), cuerpo);
          setLista((prev) => fusionar(prev, { ...editando, ...actualizado }, visto));
          aviso.ok('Mensaje editado', `El mensaje de ${visto.name} fue editado.`);
        } else {
          const creado = await crearMensaje(sesion, cuerpo);
          setLista((prev) => [{ ...creado, ...visto }, ...prev]);
          aviso.ok('Mensaje creado', `El mensaje de ${visto.name} fue creado.`);
        }
        return true;
      } catch (err) {
        aviso.errorDe(err, 'No se pudo guardar.', 'Mensaje');
        return false;
      } finally {
        setGuardando(false);
      }
    },
    [aviso, conToken, setGuardando, setLista],
  );

  const eliminar = useCallback(
    (mensaje: MensajeAdmin) => {
      const sesion = conToken();
      if (!sesion) return;
      aviso.confirmar({
        sello: 'CORREO',
        titulo: 'Eliminar mensaje',
        texto: `¿Borrar el mensaje de ${mensaje.name}?`,
        confirmar: 'ELIMINAR',
        peligro: true,
        exito: { titulo: 'Mensaje eliminado', texto: `El mensaje de ${mensaje.name} fue eliminado.` },
        onConfirmar: async () => {
          await eliminarMensaje(sesion, idDe(mensaje));
          setLista((prev) => prev.filter((item) => idDe(item) !== idDe(mensaje)));
        },
      });
    },
    [aviso, conToken, setLista],
  );

  return { mensajes, cargando, guardando, error, recargar, guardar, eliminar };
}
