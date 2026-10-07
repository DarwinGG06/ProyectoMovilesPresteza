import { useEffect, useMemo, useState } from 'react';
import { Asset } from 'expo-asset';

import type { Producto } from '@/types';

import { useMenuPublico } from './useMenuPublico';

const MODELO_LOCAL_ASSET = require('@/assets/ice_cream.glb');

export function useMenu() {
  const { productos, categorias, cargando, error } = useMenuPublico();

  const [busqueda, setBusqueda] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);
  const [visorAbierto, setVisorAbierto] = useState(false);
  const [modeloUrl, setModeloUrl] = useState<string | null>(null);
  const [nombreProducto, setNombreProducto] = useState<string | null>(null);
  const [modeloLocal, setModeloLocal] = useState<string | null>(null);

  useEffect(() => {
    let montado = true;

    async function prepararAssetLocal() {
      const asset = Asset.fromModule(MODELO_LOCAL_ASSET);
      await asset.downloadAsync();
      if (montado) setModeloLocal(asset.localUri || asset.uri);
    }

    prepararAssetLocal();

    return () => {
      montado = false;
    };
  }, []);

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

  const abrirVisor = (producto: Producto) => {
    setModeloUrl(producto.modelUrl || modeloLocal);
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
    abrirVisor,
    cerrarVisor,
    visorAbierto,
    modeloUrl,
    nombreProducto,
  };
}
