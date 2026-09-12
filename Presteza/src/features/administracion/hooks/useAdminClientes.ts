import { useCallback } from 'react';

import { crearCliente, eliminarCliente, listarUsuarios } from '../api/adminApi';
import type { ClienteAdmin, ClienteForm } from '../types';
import { useListaAdmin } from './adminComun';

export function useAdminClientes() {
  const { lista: usuarios, setLista, cargando, guardando, setGuardando, error, recargar, aviso, conToken } =
    useListaAdmin(listarUsuarios);

  const guardar = useCallback(
    async (datos: ClienteForm) => {
      setGuardando(true);
      try {
        const creado = await crearCliente({
          name: datos.name.trim(),
          email: datos.email.trim().toLowerCase(),
          phone: datos.phone.trim(),
          password: datos.password.trim(),
        });
        setLista((prev) => [creado, ...prev]);
        aviso.ok('Cliente creado', `${creado.name} ya está en la casa.`);
        return true;
      } catch (err) {
        aviso.errorDe(err, 'No se pudo crear.', 'Cliente');
        return false;
      } finally {
        setGuardando(false);
      }
    },
    [aviso, setGuardando, setLista],
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
