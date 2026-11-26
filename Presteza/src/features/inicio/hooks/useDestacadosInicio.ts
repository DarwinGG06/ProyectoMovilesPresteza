import { useEffect, useMemo, useState } from 'react';

import { listarCategorias } from '@/api/categorias';
import { listarProductos } from '@/api/productos';
import { idDe } from '@/api/helpers';
import type { Producto } from '@/types';

const BADGES = ['Más popular', 'Especial', 'Recomendado'] as const;

function conFotoPrimero(a: Producto, b: Producto) {
  const fa = a.imageUrl ? 0 : 1;
  const fb = b.imageUrl ? 0 : 1;
  if (fa !== fb) return fa - fb;
  return (b.price || 0) - (a.price || 0);
}

export function useDestacadosInicio() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [totalPlatos, setTotalPlatos] = useState(0);
  const [totalCategorias, setTotalCategorias] = useState(0);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let vivo = true;
    void (async () => {
      try {
        const [lista, categorias] = await Promise.all([listarProductos(), listarCategorias()]);
        if (!vivo) return;
        const disponibles = lista.filter((producto) => producto.available !== false);
        setProductos([...disponibles].sort(conFotoPrimero).slice(0, 3));
        setTotalPlatos(disponibles.length);
        setTotalCategorias(categorias.length);
      } catch {
        if (!vivo) return;
        setProductos([]);
        setTotalPlatos(0);
        setTotalCategorias(0);
      } finally {
        if (vivo) setCargando(false);
      }
    })();
    return () => {
      vivo = false;
    };
  }, []);

  const destacados = useMemo(
    () =>
      productos.map((producto, index) => ({
        id: idDe(producto),
        name: producto.name,
        price: producto.price,
        imageUrl: producto.imageUrl || '',
        badge: BADGES[index] || 'Destacado',
      })),
    [productos],
  );

  return { destacados, totalPlatos, totalCategorias, cargando };
}
