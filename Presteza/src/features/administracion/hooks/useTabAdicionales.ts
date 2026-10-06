import { useMemo, useState } from 'react';

import type { AdicionalAdmin, AdicionalForm } from '../types';

type FiltroAdicional = 'all' | 'on' | 'off';

export function useTabAdicionales(
  adicionales: AdicionalAdmin[],
  onGuardar: (datos: AdicionalForm, editando?: AdicionalAdmin | null) => Promise<boolean>,
) {
  const [filtro, setFiltro] = useState<FiltroAdicional>('all');
  const [vista, setVista] = useState<'lista' | 'cuadricula'>('lista');
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(true);
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState<AdicionalAdmin | null>(null);

  const lista = useMemo(() => {
    if (filtro === 'on') return adicionales.filter((item) => item.available !== false);
    if (filtro === 'off') return adicionales.filter((item) => item.available === false);
    return adicionales;
  }, [adicionales, filtro]);

  const abrir = (adicional?: AdicionalAdmin) => {
    setEditando(adicional ?? null);
    setAbierto(true);
  };

  const cerrar = () => setAbierto(false);

  const guardar = async (datos: AdicionalForm) => {
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
    abrir,
    cerrar,
    guardar,
    valoresFormulario: {
      name: editando?.name ?? '',
      price: editando ? String(editando.price) : '',
    } satisfies AdicionalForm,
  };
}
