import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';

import { idDe } from '@/api/helpers';
import type { Categoria, Producto } from '@/types';

import type { PortadaCategoria } from '../components/TarjetaCategoria';
import { useMenuPublico } from './useMenuPublico';

function slug(texto: string) {
  return texto.trim().toLowerCase();
}

function idDesdeParametro(param: string | undefined, categorias: Categoria[]) {
  if (!param?.trim()) return null;
  const porId = categorias.find((categoria) => idDe(categoria) === param);
  if (porId) return idDe(porId);
  const pedida = slug(param);
  const porNombre = categorias.find((categoria) => slug(categoria.name || '') === pedida);
  return porNombre ? idDe(porNombre) : null;
}

export function useMenu() {
  const { productos, categorias, cargando, refrescando, error, recargar } = useMenuPublico();
  const params = useLocalSearchParams<{ categoria?: string | string[] }>();
  const categoriaParam = Array.isArray(params.categoria)
    ? params.categoria[params.categoria.length - 1]
    : params.categoria;
  const categoriaConsumida = useRef<string | null>(null);

  const [busqueda, setBusqueda] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);
  const [visorAbierto, setVisorAbierto] = useState(false);
  const [modeloUrl, setModeloUrl] = useState<string | null>(null);
  const [nombreProducto, setNombreProducto] = useState<string | null>(null);

  useEffect(() => {
    if (!categoriaParam) {
      categoriaConsumida.current = null;
      return;
    }
    if (!categorias.length) return;
    if (categoriaConsumida.current === categoriaParam) return;

    const id = idDesdeParametro(categoriaParam, categorias);
    const timer = setTimeout(() => {
      categoriaConsumida.current = categoriaParam;
      if (id) setCategoriaActiva(id);
      router.setParams({ categoria: undefined });
    }, 0);
    return () => clearTimeout(timer);
  }, [categoriaParam, categorias]);

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

  const portadas = useMemo<PortadaCategoria[]>(() => {
    return categorias
      .map((categoria): PortadaCategoria | null => {
        const id = idDe(categoria);
        const platos = productos.filter((plato) => plato.categoryId === id);
        if (!id || !platos.length) return null;
        return {
          id,
          name: categoria.name,
          count: platos.length,
          imageUrl: categoria.imageUrl || platos.find((plato) => plato.imageUrl)?.imageUrl,
        };
      })
      .filter((item): item is PortadaCategoria => Boolean(item));
  }, [categorias, productos]);

  const secciones = useMemo(() => {
    if (categoriaActiva) {
      const categoria = categorias.find((item) => idDe(item) === categoriaActiva);
      return [{ title: categoria?.name || 'Carta', data: lista }];
    }

    const grupos = categorias
      .map((categoria) => {
        const data = lista.filter((plato) => plato.categoryId === idDe(categoria));
        return data.length ? { title: categoria.name, data } : null;
      })
      .filter((seccion): seccion is { title: string; data: Producto[] } => Boolean(seccion));

    const ids = new Set(categorias.map((categoria) => idDe(categoria)));
    const sueltos = lista.filter((plato) => !plato.categoryId || !ids.has(plato.categoryId));
    if (sueltos.length) grupos.push({ title: 'Carta', data: sueltos });
    return grupos;
  }, [categorias, categoriaActiva, lista]);

  return {
    categorias,
    error,
    mostrarCarga: cargando && productos.length === 0,
    refrescando,
    recargar: () => recargar(true),
    busqueda,
    setBusqueda,
    categoriaActiva,
    elegirCategoria: setCategoriaActiva,
    productos: lista,
    portadas,
    viendoCategorias: !categoriaActiva && !busqueda.trim(),
    secciones,
    tieneModelo,
    abrirVisor,
    cerrarVisor,
    visorAbierto,
    modeloUrl,
    nombreProducto,
  };
}
