import { useCallback, useEffect, useState } from 'react';
import { router } from 'expo-router';

import {
  listarPedidosEntrega,
  marcarEntregado,
  marcarSalirAEntregar,
} from '@/api/repartidor';
import { idDe } from '@/api/helpers';
import type { PedidoAdmin } from '@/features/administracion/types';
import { useSession } from '@/session/context';
import { esRepartidor } from '@/session/roles';
import { useAviso } from '@/shared/components/aviso';

function estadoClave(status?: string) {
  return String(status || '').trim().toLowerCase();
}

export function useRepartidor() {
  const { user, token, logout, isAuthenticated } = useSession();
  const aviso = useAviso();
  const [pedidos, setPedidos] = useState<PedidoAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [ocupadoId, setOcupadoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const autorizado = isAuthenticated && esRepartidor(user);

  const recargar = useCallback(async () => {
    if (!token || !esRepartidor(user)) {
      setPedidos([]);
      setCargando(false);
      return;
    }
    setError(null);
    setCargando(true);
    try {
      setPedidos(await listarPedidosEntrega(token));
    } catch (err) {
      setPedidos([]);
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los pedidos.');
    } finally {
      setCargando(false);
    }
  }, [token, user]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!esRepartidor(user)) {
      router.replace('/perfil');
      return;
    }
    void recargar();
  }, [isAuthenticated, recargar, user]);

  const salirAEntregar = useCallback(
    async (pedido: PedidoAdmin) => {
      if (!token) return;
      const id = idDe(pedido);
      if (!id || estadoClave(pedido.status) !== 'listo') return;
      setOcupadoId(id);
      try {
        await marcarSalirAEntregar(token, id);
        setPedidos((prev) =>
          prev.map((item) => (idDe(item) === id ? { ...item, status: 'en_camino' } : item)),
        );
        aviso.ok('En camino', `Saliste a entregar el pedido de ${pedido.user_name || 'cliente'}.`);
      } catch (err) {
        aviso.errorDe(err, 'No se pudo salir a entregar.', 'Reparto');
      } finally {
        setOcupadoId(null);
      }
    },
    [aviso, token],
  );

  const entregar = useCallback(
    async (pedido: PedidoAdmin) => {
      if (!token) return;
      const id = idDe(pedido);
      if (!id || estadoClave(pedido.status) !== 'en_camino') return;
      setOcupadoId(id);
      try {
        await marcarEntregado(token, id);
        setPedidos((prev) => prev.filter((item) => idDe(item) !== id));
        aviso.ok('Entregado', `El pedido de ${pedido.user_name || 'cliente'} quedó entregado.`);
      } catch (err) {
        aviso.errorDe(err, 'No se pudo marcar como entregado.', 'Reparto');
      } finally {
        setOcupadoId(null);
      }
    },
    [aviso, token],
  );

  const cerrarSesion = useCallback(() => {
    logout();
    router.replace('/home');
  }, [logout]);

  return {
    autorizado,
    nombre: user?.name ?? 'Repartidor',
    pedidos,
    cargando,
    error,
    ocupadoId,
    recargar,
    salirAEntregar,
    entregar,
    cerrarSesion,
  };
}
