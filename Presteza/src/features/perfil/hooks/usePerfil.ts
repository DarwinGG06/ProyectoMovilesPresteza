import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { usePedidosActualizados } from '@/shared/hooks/usePedidosActualizados';

import { useSession } from '@/session/context';

import { obtenerFavoritos, obtenerPedidos, obtenerReservas, obtenerUsuario } from '@/api/perfil';
import type { Pedido, PestanaId, PlatoFavorito, Reserva, UsuarioPerfil } from '../types';

const PESTANAS: PestanaId[] = [
  'cuenta',
  'puntos',
  'pedidos',
  'direcciones',
  'pagos',
  'reservas',
  'ajustes',
];

function pestanaDe(valor?: string | string[]): PestanaId | null {
  const cruda = Array.isArray(valor) ? valor[0] : valor;
  return cruda && PESTANAS.includes(cruda as PestanaId) ? (cruda as PestanaId) : null;
}

export function usePerfil() {
  const { user, token, actualizarUsuario, isAuthenticated, logout } = useSession();
  const [perfil, setPerfil] = useState<UsuarioPerfil | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const userId = user?.id;
  const consultarPedidos = useCallback(
    () => (userId ? obtenerPedidos(userId) : Promise.resolve([])),
    [userId]
  );
  usePedidosActualizados(consultarPedidos, setPedidos, Boolean(userId && token));
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [favoritos, setFavoritos] = useState<PlatoFavorito[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useLocalSearchParams<{ pestana?: string | string[] }>();
  const pestanaParam = Array.isArray(params.pestana) ? params.pestana[0] : params.pestana;
  const [pestana, setPestana] = useState<PestanaId>(() => pestanaDe(pestanaParam) ?? 'cuenta');
  const pestanaConsumida = useRef<string | null>(null);

  const recargar = useCallback(async () => {
    if (!user?.id) return;

    setCargando(true);
    setError(null);

    try {
      const [usuario, listaPedidos, listaReservas, listaFavoritos] = await Promise.all([
        obtenerUsuario(user.id),
        obtenerPedidos(user.id).catch(() => []),
        token ? obtenerReservas(token).catch(() => []) : Promise.resolve([]),
        token ? obtenerFavoritos(user.id, token).catch(() => []) : Promise.resolve([]),
      ]);

      setPerfil(usuario);
      setPedidos(listaPedidos);
      setReservas(listaReservas);
      setFavoritos(listaFavoritos);

      if (
        usuario.complete_name !== user.name ||
        usuario.email !== user.email ||
        usuario.phone_number !== user.phone
      ) {
        actualizarUsuario({
          name: usuario.complete_name,
          email: usuario.email,
          phone: usuario.phone_number,
        });
      }
    } catch (err) {
      setPerfil({
        id: user.id,
        complete_name: user.name,
        email: user.email,
        phone_number: user.phone,
        addresses: [],
        paymentCards: [],
        favoriteDishes: [],
      });
      setError(err instanceof Error ? err.message : 'No se pudo cargar el perfil.');
    } finally {
      setCargando(false);
    }
  }, [actualizarUsuario, token, user]);

  useEffect(() => {
    const timer = setTimeout(() => void recargar(), 0);
    return () => clearTimeout(timer);
  }, [recargar]);

  useEffect(() => {
    const pedida = pestanaDe(pestanaParam);
    if (!pedida) {
      pestanaConsumida.current = null;
      return;
    }
    if (pestanaConsumida.current === pedida) return;
    pestanaConsumida.current = pedida;
    setPestana(pedida);
    router.setParams({ pestana: undefined });
  }, [pestanaParam]);

  useEffect(() => {
    if (user?.role === 'admin') {
      router.replace('/home/admin' as Href);
    }
  }, [user?.role]);

  return {
    user,
    token,
    isAuthenticated,
    logout,
    perfil,
    setPerfil,
    pedidos,
    setPedidos,
    reservas,
    setReservas,
    favoritos,
    cargando,
    error,
    recargar,
    pestana,
    setPestana,
  };
}
