import { useCallback } from 'react';

import { actualizarCliente, crearCliente, eliminarCliente, listarUsuarios } from '@/api/auth';
import type { ClienteAdmin, ClienteForm } from '../types';
import { fusionar, useListaAdmin } from './adminComun';

export function useAdminClientes() {
  const { lista: usuarios, setLista, cargando, guardando, setGuardando, error, recargar, aviso, conToken } =
    useListaAdmin(listarUsuarios);

  const guardar = useCallback(
    async (datos: ClienteForm, editando?: ClienteAdmin | null) => {
      const name = datos.name.trim();
      const email = datos.email.trim().toLowerCase();
      const phone = datos.phone.trim();
      const password = datos.password.trim();

      setGuardando(true);
      try {
        if (editando) {
          const sesion = conToken();
          if (!sesion) return false;
          const cambios: { name?: string; email?: string; phone?: string; password?: string } = {};
          if (name !== (editando.name ?? '')) cambios.name = name;
          if (email !== (editando.email ?? '')) cambios.email = email;
          if (phone !== (editando.phone ?? '')) cambios.phone = phone;
          if (password) cambios.password = password;
          if (!Object.keys(cambios).length) {
            aviso.ok('Sin cambios', 'No hay nada que guardar.');
            return true;
          }
          await actualizarCliente(sesion, editando.id, cambios);
          const { password: _omitida, ...visibles } = cambios;
          setLista((prev) => fusionar(prev, editando, visibles));
          aviso.ok('Cliente editado', `${name} fue actualizado.`);
        } else {
          const creado = await crearCliente({ name, email, phone, password });
          setLista((prev) => [creado, ...prev]);
          aviso.ok('Cliente creado', `${creado.name} ya está en la casa.`);
        }
        return true;
      } catch (err) {
        aviso.errorDe(err, 'No se pudo guardar.', 'Cliente');
        return false;
      } finally {
        setGuardando(false);
      }
    },
    [aviso, conToken, setGuardando, setLista],
  );

  const eliminar = useCallback(
    (cliente: ClienteAdmin) => {
      const sesion = conToken();
      if (!sesion) return;
      aviso.confirmar({
        sello: 'CLIENTES',
        titulo: 'Eliminar cliente',
        texto: `¿Quitar a ${cliente.name || cliente.email} de la casa?`,
        confirmar: 'ELIMINAR',
        peligro: true,
        exito: { titulo: 'Cliente eliminado', texto: `${cliente.name || cliente.email} fue eliminado.` },
        onConfirmar: async () => {
          await eliminarCliente(sesion, cliente.id);
          setLista((prev) => prev.filter((item) => item.id !== cliente.id));
        },
      });
    },
    [aviso, conToken, setLista],
  );

  return { usuarios, cargando, guardando, error, recargar, guardar, eliminar };
}
