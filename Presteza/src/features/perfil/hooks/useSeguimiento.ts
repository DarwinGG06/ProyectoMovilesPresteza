import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { idPedido, obtenerPedidos } from '@/api/perfil';
import { useSession } from '@/session/context';
import { esAdmin } from '@/session/roles';

import type { Pedido } from '../types';

export function useSeguimiento() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { user, isAuthenticated } = useSession();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async (silencio = false) => {
    if (!user?.id) {
      setCargando(false);
      return;
    }
    if (!silencio) setError(null);
    try {
      const lista = await obtenerPedidos(user.id);
      const ordenados = [...lista].sort(
        (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
      );
      const encontrado = id ? ordenados.find((item) => idPedido(item) === id) : ordenados[0];
      setPedido(encontrado ?? null);
    } catch (err) {
      if (!silencio) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar el pedido.');
        setPedido(null);
      }
    } finally {
      setCargando(false);
    }
  }, [id, user?.id]);

  useEffect(() => {
    if (esAdmin(user)) {
      router.replace('/home/admin');
    }
  }, [user]);

  useEffect(() => {
    setCargando(true);
    void recargar();
  }, [recargar]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    const timer = setInterval(() => void recargar(true), 12000);
    return () => clearInterval(timer);
  }, [isAuthenticated, recargar, user?.id]);

  return {
    pedido,
    cargando,
    error,
    isAuthenticated,
    recargar,
    irAlPerfil: () => router.replace('/perfil'),
    irAlMenu: () => router.push('/home/menu'),
  };
}
