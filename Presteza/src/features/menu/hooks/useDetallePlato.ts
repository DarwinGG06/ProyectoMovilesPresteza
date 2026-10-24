import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';

import { listarAdicionalesPorCategoria } from '@/api/admin';
import { idDe } from '@/api/helpers';
import type { AdicionalAdmin } from '@/features/administracion/types';
import { formatCOP, idLineaBandeja, useCart } from '@/services/cart/CartContext';

import { extrasSugeridos } from '../data/adicionales';
import { useMenuPublico } from './useMenuPublico';

export function useDetallePlato() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { productos, categorias, cargando, error } = useMenuPublico();
  const { items, addItem, updateQuantity } = useCart();
  const [visorAbierto, setVisorAbierto] = useState(false);
  const [adicionales, setAdicionales] = useState<AdicionalAdmin[]>([]);
  const [elegidos, setElegidos] = useState<string[]>([]);
  const [cantidadLocal, setCantidadLocal] = useState(1);

  const producto = useMemo(
    () => productos.find((item) => idDe(item) === id) ?? null,
    [id, productos],
  );

  const categoria = useMemo(() => {
    if (!producto) return '';
    return (
      categorias.find((item) => idDe(item) === producto.categoryId)?.name ||
      producto.category ||
      ''
    );
  }, [producto, categorias]);

  useEffect(() => {
    if (!producto?.categoryId) {
      setAdicionales([]);
      return;
    }
    let montado = true;
    void listarAdicionalesPorCategoria(producto.categoryId).then((lista) => {
      if (montado) setAdicionales(lista);
    });
    return () => {
      montado = false;
    };
  }, [producto?.categoryId]);

  const extras = useMemo(() => {
    if (!producto) return [];
    if (adicionales.length) return adicionales;
    return extrasSugeridos(categoria, producto.name);
  }, [adicionales, categoria, producto]);

  const extrasElegidos = extras.filter((extra) => elegidos.includes(idDe(extra) || extra.name));
  const opciones = extrasElegidos.map((extra) => ({
    name: extra.price ? `${extra.name} (+${formatCOP(extra.price)})` : extra.name,
    price: extra.price,
  }));
  const extraPrecio = extrasElegidos.reduce((suma, extra) => suma + (Number(extra.price) || 0), 0);
  const unitario = (producto?.price || 0) + extraPrecio;
  const linea = producto ? items.find((item) => item.id === idLineaBandeja(idDe(producto), opciones)) : undefined;
  const enBandeja = Boolean(linea);
  const cantidad = linea?.quantity ?? cantidadLocal;
  const total = unitario * Math.max(cantidad, 1);

  const alternarExtra = (extra: AdicionalAdmin) => {
    const clave = idDe(extra) || extra.name;
    setElegidos((prev) => (prev.includes(clave) ? prev.filter((item) => item !== clave) : [...prev, clave]));
    if (!linea) setCantidadLocal(1);
  };

  const cambiarCantidad = (siguiente: number) => {
    if (linea) {
      updateQuantity(linea.id, siguiente);
      return;
    }
    setCantidadLocal(Math.max(1, siguiente));
  };

  const agregar = () => {
    if (!producto) return;
    addItem({
      id: idDe(producto),
      productName: producto.name,
      unitPrice: unitario,
      quantity: cantidadLocal,
      selectedOptions: opciones,
    });
  };

  return {
    producto,
    categoria,
    descripcion: producto?.description?.trim() || '',
    extras,
    extraActivo: (extra: AdicionalAdmin) => elegidos.includes(idDe(extra) || extra.name),
    alternarExtra,
    cantidad,
    sumar: () => cambiarCantidad(cantidad + 1),
    restar: () => cambiarCantidad(cantidad - 1),
    cargando: cargando && !producto,
    error,
    total: formatCOP(total),
    tieneModelo: Boolean(producto?.modelUrl),
    visorAbierto,
    abrirVisor: () => setVisorAbierto(true),
    cerrarVisor: () => setVisorAbierto(false),
    agregar,
    enBandeja,
    volver: () => router.back(),
    irABandeja: () => router.push('/pago'),
  };
}
