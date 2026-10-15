import { useMemo, useState } from 'react';

import type { InsumoAdmin, InsumoForm } from '../types';

const UMBRAL = 10;

type FiltroInventario = 'all' | 'low' | 'out';

export function useTabInventario(
  insumos: InsumoAdmin[],
  onGuardar: (datos: InsumoForm, editando?: InsumoAdmin | null) => Promise<boolean>,
) {
  const [filtro, setFiltro] = useState<FiltroInventario>('all');
  const [vista, setVista] = useState<'lista' | 'cuadricula'>('lista');
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(true);
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState<InsumoAdmin | null>(null);

  const lista = useMemo(() => {
    if (filtro === 'out') return insumos.filter((item) => item.quantity === 0);
    if (filtro === 'low') return insumos.filter((item) => item.quantity > 0 && item.quantity < UMBRAL);
    return insumos;
  }, [filtro, insumos]);

  const sello = (cantidad: number) => {
    if (cantidad === 0) return 'AGOTADO';
    if (cantidad < UMBRAL) return 'BAJO';
    return 'OK';
  };

  const abrir = (insumo?: InsumoAdmin) => {
    setEditando(insumo ?? null);
    setAbierto(true);
  };

  const cerrar = () => setAbierto(false);

  const guardar = async (datos: InsumoForm) => {
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
    lista,
    sello,
    abrir,
    cerrar,
    guardar,
    valoresFormulario: {
      name: editando?.name ?? '',
      description: editando?.description ?? '',
      unit_price: editando ? String(editando.unit_price) : '',
      quantity: editando ? String(editando.quantity) : '',
    } satisfies InsumoForm,
  };
}
