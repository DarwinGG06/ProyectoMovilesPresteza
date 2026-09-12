import { useCallback } from 'react';

import {
  actualizarEstadoPedido,
  actualizarPedido,
  crearPedido,
  eliminarPedido,
  listarPedidos,
} from '../api/adminApi';
import type { ClienteAdmin, PedidoAdmin, PedidoForm } from '../types';
import { estadoPedidoBackend, idDe, textoEstadoPedido } from '../utils';
import { fusionar, useListaAdmin } from './adminComun';

export function useAdminPedidos() {
  const { lista: pedidos, setLista, cargando, guardando, setGuardando, error, recargar, aviso, conToken } =
    useListaAdmin(listarPedidos);

  const guardar = useCallback(
    async (datos: PedidoForm, editando: PedidoAdmin | null | undefined, clientes: ClienteAdmin[]) => {
      const sesion = conToken();
      if (!sesion) return false;
      const cliente = clientes.find((item) => item.id === datos.userId);
      if (!cliente) {
        aviso.error('Pedido', 'Elige un cliente.');
        return false;
      }
      if (!datos.lineas.length) {
        aviso.error('Pedido', 'Agrega al menos un plato.');
        return false;
      }

      const cuerpo = {
        usuarioId: cliente.id,
        user_name: cliente.name,
        payment_method: datos.payment_method,
        status: estadoPedidoBackend(datos.status),
        products: datos.lineas.map((linea) => ({
          dishId: linea.dishId,
          name: linea.name,
          quantity: linea.quantity,
          unit_price: linea.unit_price,
          description: linea.description || linea.name,
        })),
        total: datos.lineas.reduce((suma, linea) => suma + linea.unit_price * linea.quantity, 0),
      };

      setGuardando(true);
      try {
        if (editando) {
          const actualizado = await actualizarPedido(sesion, idDe(editando), cuerpo);
          setLista((prev) => fusionar(prev, { ...editando, ...actualizado }, { ...cuerpo, userId: cliente.id }));
          aviso.ok('Pedido editado', `El pedido de ${cliente.name} fue editado.`);
        } else {
          const creado = await crearPedido(sesion, cuerpo);
          setLista((prev) => [{ ...creado, ...cuerpo, userId: cliente.id }, ...prev]);
          aviso.ok('Pedido creado', `El pedido de ${cliente.name} fue creado.`);
        }
        return true;
      } catch (err) {
        aviso.errorDe(err, 'No se pudo guardar.', 'Pedido');
        return false;
      } finally {
        setGuardando(false);
      }
    },
    [aviso, conToken, setGuardando, setLista],
  );

  const cambiarEstado = useCallback(
    (pedido: PedidoAdmin, status: string) => {
      const sesion = conToken();
      if (!sesion) return;
      const id = idDe(pedido);
      const codigo = id.slice(-8).toUpperCase();
      const estadoNuevo = textoEstadoPedido(status);
      const estadoActual = textoEstadoPedido(pedido.status);
      const esCancelar = status === 'cancelled';

      if (estadoPedidoBackend(pedido.status) === estadoPedidoBackend(status)) {
        aviso.ok('Pedido', `El pedido #${codigo} ya está ${estadoNuevo.toLowerCase()}.`);
        return;
      }

      aviso.confirmar({
        sello: 'PEDIDOS',
        titulo: esCancelar ? 'Cancelar pedido' : 'Cambiar estado',
        texto: esCancelar
          ? `¿Quieres cancelar el pedido #${codigo}?`
          : `¿Cambiar el pedido #${codigo} de ${estadoActual.toLowerCase()} a ${estadoNuevo.toLowerCase()}?`,
        confirmar: esCancelar ? 'CANCELAR PEDIDO' : 'CAMBIAR',
        peligro: esCancelar,
        exito: {
          titulo: esCancelar ? 'Pedido cancelado' : 'Estado cambiado',
          texto: esCancelar
            ? `El pedido #${codigo} fue cancelado.`
            : `El pedido #${codigo} cambió a ${estadoNuevo.toLowerCase()}.`,
        },
        onConfirmar: async () => {
          await actualizarEstadoPedido(sesion, id, status);
          setLista((prev) => fusionar(prev, pedido, { status }));
        },
      });
    },
    [aviso, conToken, setLista],
  );

  const eliminar = useCallback(
    (pedido: PedidoAdmin) => {
      const sesion = conToken();
      if (!sesion) return;
      const codigo = idDe(pedido).slice(-8).toUpperCase();
      aviso.confirmar({
        sello: 'PEDIDOS',
        titulo: 'Eliminar pedido',
        texto: `¿Borrar el pedido #${codigo}?`,
        confirmar: 'ELIMINAR',
        peligro: true,
        exito: { titulo: 'Pedido eliminado', texto: `El pedido #${codigo} fue eliminado.` },
        onConfirmar: async () => {
          await eliminarPedido(sesion, idDe(pedido));
          setLista((prev) => prev.filter((item) => idDe(item) !== idDe(pedido)));
        },
      });
    },
    [aviso, conToken, setLista],
  );

  return { pedidos, cargando, guardando, error, recargar, guardar, cambiarEstado, eliminar };
}
