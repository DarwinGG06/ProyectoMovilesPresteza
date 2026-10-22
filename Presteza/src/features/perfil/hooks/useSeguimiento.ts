import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { idPedido, obtenerPedidos } from '@/api/perfil';
import { useSession } from '@/session/context';

import type { Pedido } from '../types';

export function useSeguimiento() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { user, isAuthenticated } = useSession();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    if (!user?.id) {
      setCargando(false);
      return;
    }
    setError(null);
    try {
      const lista = await obtenerPedidos(user.id);
      const ordenados = [...lista].sort(
        (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
      );
      const encontrado = id ? ordenados.find((item) => idPedido(item) === id) : ordenados[0];
      setPedido(encontrado ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el pedido.');
      setPedido(null);
    } finally {
      setCargando(false);
    }
  }, [id, user?.id]);

  useEffect(() => {
    setCargando(true);
    void recargar();
  }, [recargar]);

  return {
    pedido,
    cargando,
    error,
    isAuthenticated,
    recargar,
    irAlPerfil: () => router.push('/perfil'),
    irAlMenu: () => router.push('/home/menu'),
  };
}
