import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';

import { idDe } from '@/api/helpers';
import { formatCOP, useCart } from '@/services/cart/CartContext';

import { useMenuPublico } from './useMenuPublico';

export function useDetallePlato() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { productos, cargando, error } = useMenuPublico();
  const { addItem } = useCart();
  const [visorAbierto, setVisorAbierto] = useState(false);
  const [enBandeja, setEnBandeja] = useState(false);

  const producto = useMemo(
    () => productos.find((item) => idDe(item) === id) ?? null,
    [id, productos],
  );

  const agregar = () => {
    if (!producto) return;
    addItem({
      id: idDe(producto),
      productName: producto.name,
      unitPrice: producto.price || 0,
    });
    setEnBandeja(true);
  };

  return {
    producto,
    cargando: cargando && !producto,
    error,
    precio: formatCOP(producto?.price || 0),
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
