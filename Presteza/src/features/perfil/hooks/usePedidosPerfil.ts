import { router } from 'expo-router';
import { useState } from 'react';

import { archivarPedido, idPedido } from '@/api/perfil';
import { useCart } from '@/services/cart/CartContext';
import { useSession } from '@/session/context';
import { useAviso } from '@/shared/components/aviso';

import type { Pedido } from '../types';

export function usePedidosPerfil(
  pedidos: Pedido[],
  onArchivado?: (id: string) => void,
) {
  const { addItem } = useCart();
  const { token } = useSession();
  const aviso = useAviso();
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
    router.push('/home/menu');
  };

  const archivar = (pedido: Pedido) => {
    if (!token) return;
    const id = idPedido(pedido);
    const codigo = id.slice(-8).toUpperCase();
    aviso.confirmar({
      sello: 'PAPELERA',
      titulo: 'Mover a papelera',
      texto: `¿Archivar el pedido #${codigo}? Podrás recuperarlo después.`,
      confirmar: 'ARCHIVAR',
      exito: {
        titulo: 'En la papelera',
        texto: `El pedido #${codigo} quedó en tu archivo.`,
      },
      onConfirmar: async () => {
        await archivarPedido(token, id);
        onArchivado?.(id);
      },
    });
  };

  return {
    lista,
    estaAbierto: (id: string) => abiertos.includes(id),
    alternarDetalle,
    repetir,
    archivar,
    irAlMenu: () => router.push('/home/menu'),
    irASeguimiento: (id: string) => router.push(`/seguimiento?id=${id}`),
  };
}
