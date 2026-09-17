import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { useSession } from '@/session/context';

import {
  obtenerFavoritos,
  obtenerPedidos,
  obtenerReservas,
  obtenerUsuario,
} from '@/api/perfil';
import type { Pedido, PestanaId, PlatoFavorito, Reserva, UsuarioPerfil } from '../types';

export function usePerfil() {
  const { user, token, actualizarUsuario, isAuthenticated, logout } = useSession();
  const [perfil, setPerfil] = useState<UsuarioPerfil | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [favoritos, setFavoritos] = useState<PlatoFavorito[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pestana, setPestana] = useState<PestanaId>('cuenta');

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
    recargar();
  }, [recargar]);

  useEffect(() => {
    if (user?.role === 'admin') {
      router.replace('/administracion');
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
