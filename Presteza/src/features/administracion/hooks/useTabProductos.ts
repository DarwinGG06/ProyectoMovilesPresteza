import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';

import type { AdicionalAdmin, CategoriaAdmin, ProductoAdmin, ProductoForm } from '../types';
import { idDe } from '../utils';

type Disponibilidad = 'all' | 'carta' | 'oculto';

export function useTabProductos(
  productos: ProductoAdmin[],
  categorias: CategoriaAdmin[],
  onGuardar: (datos: ProductoForm, editando?: ProductoAdmin | null) => Promise<boolean>,
  adicionales: AdicionalAdmin[] = [],
) {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [disponibilidad, setDisponibilidad] = useState<Disponibilidad>('all');
  const [vista, setVista] = useState<'lista' | 'cuadricula'>('lista');
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(true);
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState<ProductoAdmin | null>(null);
  const params = useLocalSearchParams<{ nuevo?: string | string[] }>();
  const nuevoParam = Array.isArray(params.nuevo) ? params.nuevo[0] : params.nuevo;

  useEffect(() => {
    if (nuevoParam !== '1') return;
    setEditando(null);
    setAbierto(true);
    router.setParams({ nuevo: undefined });
  }, [nuevoParam]);

  const lista = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return productos.filter((producto) => {
      const coincideTexto = !texto || producto.name.toLowerCase().includes(texto);
      const coincideCategoria = !categoriaFiltro || producto.categoryId === categoriaFiltro;
      const coincideCarta =
        disponibilidad === 'all' ||
        (disponibilidad === 'carta' ? producto.available !== false : producto.available === false);
      return coincideTexto && coincideCategoria && coincideCarta;
    });
  }, [busqueda, categoriaFiltro, disponibilidad, productos]);

  const nombreCategoria = (id?: string) => categorias.find((categoria) => idDe(categoria) === id)?.name || '—';

  const abrir = (producto?: ProductoAdmin) => {
    setEditando(producto ?? null);
    setAbierto(true);
  };

  const cerrar = () => setAbierto(false);

  const guardar = async (datos: ProductoForm) => {
    if (await onGuardar(datos, editando)) setAbierto(false);
  };

  return {
    busqueda,
    setBusqueda,
    categoriaFiltro,
    setCategoriaFiltro,
    disponibilidad,
    setDisponibilidad,
    vista,
    setVista,
    filtrosAbiertos,
    setFiltrosAbiertos,
    abierto,
    editando,
    lista,
    nombreCategoria,
    abrir,
    cerrar,
    guardar,
    valoresFormulario: {
      name: editando?.name ?? '',
      description: editando?.description ?? '',
      price: editando ? String(editando.price) : '',
      categoryId: editando?.categoryId ?? idDe(categorias[0]),
      imageUrl: editando?.imageUrl ?? '',
      modelUrl: editando?.modelUrl ?? '',
      adicionalIds: adicionales
        .filter((item) =>
          (item.categoryIds ?? []).some(
            (id) => String(id) === String(editando?.categoryId ?? idDe(categorias[0])),
          ),
        )
        .map((item) => idDe(item)),
    } satisfies ProductoForm,
  };
}
