import { useCallback, useEffect, useState } from 'react';

import { listarCategorias } from '@/api/categorias';
import { listarProductos } from '@/api/productos';
import type { Categoria, Producto } from '@/types';

export function useMenuPublico() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async (desdePull = false) => {
    if (desdePull) setRefrescando(true);
    else setCargando(true);
    setError(null);

    try {
      const [listaProductos, listaCategorias] = await Promise.all([
        listarProductos(),
        listarCategorias(),
      ]);
      setProductos(listaProductos.filter((producto) => producto.available !== false));
      setCategorias(listaCategorias);
    } catch (err) {
      setError('No pudimos cargar el menú en este momento.');
      console.error('Error cargando el menú público:', err);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  return { productos, categorias, cargando, refrescando, error, recargar };
}
