import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { cancelarPedido, idPedido, obtenerPedidos } from '@/api/perfil';
import { useSession } from '@/session/context';
import { esAdmin, esRepartidor } from '@/session/roles';
import { useAviso } from '@/shared/components/aviso';

import type { Pedido } from '../types';

export function useSeguimiento() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { user, token, isAuthenticated } = useSession();
  const aviso = useAviso();
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
      return;
    }
    if (esRepartidor(user)) {
      router.replace('/home/repartidor');
    }
  }, [user]);

  useEffect(() => {
    setCargando(true);
    void recargar();
  }, [recargar]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    const enCamino = String(pedido?.status || '').toLowerCase() === 'en_camino';
    // En camino: cada 3 s. El resto: cada 10 s.
    const timer = setInterval(() => void recargar(true), enCamino ? 3000 : 10000);
    return () => clearInterval(timer);
  }, [isAuthenticated, pedido?.status, recargar, user?.id]);

  const cancelar = useCallback(() => {
    if (!token || !pedido) return;
    const id = idPedido(pedido);
    if (!id || String(pedido.status || '').toLowerCase() !== 'pendiente') return;
    aviso.confirmar({
      sello: 'PEDIDO',
      titulo: 'Cancelar pedido',
      texto: 'Solo puedes cancelarlo mientras sigue pendiente.',
      confirmar: 'CANCELAR PEDIDO',
      peligro: true,
      exito: { titulo: 'Pedido cancelado', texto: 'El pedido quedó cancelado.' },
      onConfirmar: async () => {
        await cancelarPedido(token, id);
        await recargar(true);
      },
    });
  }, [aviso, pedido, recargar, token]);

  return {
    pedido,
    cargando,
    error,
    isAuthenticated,
    recargar,
    cancelar,
    irAlPerfil: () => router.replace('/perfil'),
    irAlMenu: () => router.push('/home/menu'),
  };
}
