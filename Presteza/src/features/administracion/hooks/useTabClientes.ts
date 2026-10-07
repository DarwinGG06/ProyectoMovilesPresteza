import { useEffect, useMemo, useState } from 'react';

import type { ClienteAdmin, ClienteForm } from '../types';

type FiltroCliente = 'all' | 'pedidos' | 'reservas';

export function useTabClientes(
  clientes: ClienteAdmin[],
  onGuardar: (datos: ClienteForm, editando?: ClienteAdmin | null) => Promise<boolean>,
) {
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<FiltroCliente>('all');
  const [vista, setVista] = useState<'lista' | 'cuadricula'>('lista');
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(true);
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState<ClienteAdmin | null>(null);
  const [detalle, setDetalle] = useState<ClienteAdmin | null>(null);

  const lista = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return clientes.filter((cliente) => {
      const coincideTexto =
        !texto ||
        [cliente.name, cliente.email, cliente.phone].filter(Boolean).some((campo) => campo!.toLowerCase().includes(texto));
      const coincideActividad =
        filtro === 'all' ||
        (filtro === 'pedidos' ? (cliente.totalOrders ?? 0) > 0 : (cliente.totalReservations ?? 0) > 0);
      return coincideTexto && coincideActividad;
    });
  }, [busqueda, clientes, filtro]);

  useEffect(() => {
    if (detalle && !clientes.some((item) => item.id === detalle.id)) setDetalle(null);
  }, [clientes, detalle]);

  const abrir = (cliente?: ClienteAdmin) => {
    setEditando(cliente ?? null);
    setAbierto(true);
  };

  const cerrar = () => setAbierto(false);

  const guardar = async (datos: ClienteForm) => {
    if (await onGuardar(datos, editando)) setAbierto(false);
  };

  return {
    busqueda,
    setBusqueda,
    filtro,
    setFiltro,
    vista,
    setVista,
    filtrosAbiertos,
    setFiltrosAbiertos,
    abierto,
    editando,
    detalle,
    setDetalle,
    lista,
    abrir,
    cerrar,
    guardar,
    valoresFormulario: {
      name: editando?.name ?? '',
      email: editando?.email ?? '',
      phone: editando?.phone ?? '',
      password: '',
    } satisfies ClienteForm,
  };
}
