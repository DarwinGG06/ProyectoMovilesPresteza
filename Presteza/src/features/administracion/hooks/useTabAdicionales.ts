import { useMemo, useState } from 'react';

import type { AdicionalAdmin, AdicionalForm, CategoriaAdmin } from '../types';
import { idDe } from '../utils';

type FiltroAdicional = 'all' | 'on' | 'off';

export function useTabAdicionales(
  adicionales: AdicionalAdmin[],
  categorias: CategoriaAdmin[] = [],
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

  const nombresCategoria = (ids?: string[]) => {
    if (!ids?.length) return 'Sin categoría';
    const nombres = ids
      .map((id) => (categorias ?? []).find((categoria) => idDe(categoria) === id)?.name)
      .filter((nombre): nombre is string => Boolean(nombre));
    return nombres.length ? nombres.join(' · ') : 'Sin categoría';
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
    nombresCategoria,
    valoresFormulario: {
      name: editando?.name ?? '',
      price: editando ? String(editando.price) : '',
      categoryIds: editando?.categoryIds ?? [],
    } satisfies AdicionalForm,
  };
}
