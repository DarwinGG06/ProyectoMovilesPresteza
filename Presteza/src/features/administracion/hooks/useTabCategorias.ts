import { useMemo, useState } from 'react';

import type { CategoriaAdmin, CategoriaForm } from '../types';

export function useTabCategorias(
  categorias: CategoriaAdmin[],
  onGuardar: (datos: CategoriaForm, editando?: CategoriaAdmin | null) => Promise<boolean>,
) {
  const [busqueda, setBusqueda] = useState('');
  const [vista, setVista] = useState<'lista' | 'cuadricula'>('cuadricula');
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState<CategoriaAdmin | null>(null);

  const lista = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return categorias;
    return categorias.filter(
      (categoria) =>
        categoria.name.toLowerCase().includes(texto) || (categoria.description ?? '').toLowerCase().includes(texto),
    );
  }, [busqueda, categorias]);

  const abrir = (categoria?: CategoriaAdmin) => {
    setEditando(categoria ?? null);
    setAbierto(true);
  };

  const cerrar = () => setAbierto(false);

  const guardar = async (datos: CategoriaForm) => {
    if (await onGuardar(datos, editando)) setAbierto(false);
  };

  return {
    busqueda,
    setBusqueda,
    vista,
    setVista,
    abierto,
    editando,
    lista,
    abrir,
    cerrar,
    guardar,
    valoresFormulario: {
      name: editando?.name ?? '',
      description: editando?.description ?? '',
      imageUrl: editando?.imageUrl ?? '',
    } satisfies CategoriaForm,
  };
}
