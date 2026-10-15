import { router } from 'expo-router';
import { useState } from 'react';

import { useCart } from '@/services/cart/CartContext';

import type { Pedido } from '../types';

export function usePedidosPerfil(pedidos: Pedido[]) {
  const { addItem } = useCart();
  const [abiertos, setAbiertos] = useState<string[]>([]);

  const lista = [...pedidos].sort(
    (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
  );

  const alternarDetalle = (id: string) => {
    setAbiertos((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const repetir = (pedido: Pedido) => {
    pedido.products?.forEach((item) => {
      addItem({
        id: item.dishId,
        productName: item.name,
        unitPrice: item.unit_price,
      });
    });
    router.push('/menu');
  };

  return {
    lista,
    estaAbierto: (id: string) => abiertos.includes(id),
    alternarDetalle,
    repetir,
    irAlMenu: () => router.push('/menu'),
  };
}
