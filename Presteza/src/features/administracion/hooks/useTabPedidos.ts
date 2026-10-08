import { useEffect, useMemo, useState } from 'react';

import type { ClienteAdmin, PedidoAdmin, PedidoForm } from '../types';
import { estadoPedidoBackend, idDe } from '../utils';

export const FILTROS_PEDIDOS = [
  { id: 'all', etiqueta: 'TODOS' },
  { id: 'pending', etiqueta: 'PENDIENTES' },
  { id: 'preparing', etiqueta: 'PREPARANDO' },
  { id: 'ready', etiqueta: 'LISTOS' },
  { id: 'delivered', etiqueta: 'ENTREGADOS' },
] as const;

type FiltroPedido = (typeof FILTROS_PEDIDOS)[number]['id'];

function valoresDe(pedido?: PedidoAdmin | null, clienteId = ''): PedidoForm {
  return {
    userId: pedido?.userId || clienteId,
    payment_method: pedido?.payment_method || 'cash',
    status: estadoPedidoBackend(pedido?.status || 'pendiente'),
    lineas: (pedido?.products ?? []).map((producto) => ({
      dishId: producto.dishId || producto.name || '',
      name: producto.name || 'Plato',
      quantity: producto.quantity || 1,
      unit_price: producto.unit_price || 0,
      description: producto.name || 'Plato',
    })),
  };
}

export function useTabPedidos(
  pedidos: PedidoAdmin[],
  clientes: ClienteAdmin[],
  onGuardar: (datos: PedidoForm, editando?: PedidoAdmin | null) => Promise<boolean>,
) {
  const [filtro, setFiltro] = useState<FiltroPedido>('all');
  const [vista, setVista] = useState<'lista' | 'cuadricula'>('lista');
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(true);
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState<PedidoAdmin | null>(null);
  const [detalle, setDetalle] = useState<PedidoAdmin | null>(null);

  const lista = useMemo(() => {
    const ordenados = [...pedidos].sort(
      (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
    );
    if (filtro === 'all') return ordenados;
    return ordenados.filter((pedido) => {
      const estado = pedido.status;
      if (filtro === 'pending') return estado === 'pending' || estado === 'pendiente';
      if (filtro === 'preparing') return estado === 'preparing' || estado === 'en_proceso' || estado === 'Preparando';
      if (filtro === 'ready') return estado === 'ready' || estado === 'completado' || estado === 'listo';
      if (filtro === 'delivered') return estado === 'delivered' || estado === 'entregado';
      return true;
    });
  }, [filtro, pedidos]);

  // Si el pedido que se está viendo desaparece de la lista (p. ej. se eliminó), se cierra el detalle.
  useEffect(() => {
    if (detalle && !pedidos.some((item) => idDe(item) === idDe(detalle))) setDetalle(null);
  }, [detalle, pedidos]);

  const abrir = (pedido?: PedidoAdmin) => {
    setEditando(pedido ?? null);
    setAbierto(true);
  };

  const cerrar = () => setAbierto(false);

  const verDetalle = (pedido: PedidoAdmin) => setDetalle(pedido);

  const cerrarDetalle = () => setDetalle(null);

  const editarDesdeDetalle = () => {
    if (!detalle) return;
    const pedido = detalle;
    setDetalle(null);
    abrir(pedido);
  };

  const guardar = async (datos: PedidoForm) => {
    if (await onGuardar(datos, editando)) setAbierto(false);
  };

  return {
    filtro,
    setFiltro,
    vista,
    setVista,
    filtrosAbiertos,
    setFiltrosAbiertos,
    abierto,
    editando,
    detalle,
    lista,
    abrir,
    cerrar,
    verDetalle,
    cerrarDetalle,
    editarDesdeDetalle,
    guardar,
    valoresFormulario: valoresDe(editando, clientes[0]?.id ?? ''),
  };
}
