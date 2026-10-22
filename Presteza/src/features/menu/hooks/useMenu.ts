import { useMemo, useState } from 'react';

import type { Producto } from '@/types';

import { useMenuPublico } from './useMenuPublico';

export function useMenu() {
  const { productos, categorias, cargando, error } = useMenuPublico();

  const [busqueda, setBusqueda] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);
  const [visorAbierto, setVisorAbierto] = useState(false);
  const [modeloUrl, setModeloUrl] = useState<string | null>(null);
  const [nombreProducto, setNombreProducto] = useState<string | null>(null);

  const lista = useMemo(() => {
    return productos.filter((producto) => {
      const coincideBusqueda =
        producto.name.toLowerCase().includes(busqueda.toLowerCase()) ||
        (producto.description &&
          producto.description.trim().toLowerCase().includes(busqueda.toLowerCase()));

      const coincideCategoria = categoriaActiva ? producto.categoryId === categoriaActiva : true;

      return coincideBusqueda && coincideCategoria;
    });
  }, [productos, busqueda, categoriaActiva]);

  /** El modelo lo sube el admin en Productos; los platos sin modelo no muestran el cubo. */
  const tieneModelo = (producto: Producto) => Boolean(producto.modelUrl);

  const abrirVisor = (producto: Producto) => {
    if (!producto.modelUrl) return;
    setModeloUrl(producto.modelUrl);
    setNombreProducto(producto.name);
    setVisorAbierto(true);
  };

  const cerrarVisor = () => {
    setVisorAbierto(false);
    setTimeout(() => {
      setModeloUrl(null);
      setNombreProducto(null);
    }, 300);
  };

  return {
    categorias,
    error,
    mostrarCarga: cargando && productos.length === 0,
    busqueda,
    setBusqueda,
    categoriaActiva,
    elegirCategoria: setCategoriaActiva,
    productos: lista,
    tieneModelo,
    abrirVisor,
    cerrarVisor,
    visorAbierto,
    modeloUrl,
    nombreProducto,
  };
}
