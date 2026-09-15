import { useCallback, useEffect, useState } from 'react';

import { useSession } from '@/session/context';
import { useAviso } from '@/shared/components/aviso';

import { idDe } from '../utils';

export function fusionar<T extends { _id?: string; id?: string }>(lista: T[], actual: T, extra: Partial<T>) {
  const id = idDe(actual);
  return lista.map((item) => (idDe(item) === id ? { ...item, ...actual, ...extra } : item));
}

export function useSesionAdmin() {
  const { user, token, logout, actualizarUsuario, isAuthenticated } = useSession();
  const aviso = useAviso();

  const conToken = useCallback(() => {
    if (!token) {
      aviso.error('Administración', 'Inicia sesión como admin.');
      return null;
    }
    return token;
  }, [aviso, token]);

  return { user, token, logout, actualizarUsuario, isAuthenticated, aviso, conToken };
}

export function useListaAdmin<T>(listar: (token: string) => Promise<T[]>) {
  const { token, aviso, conToken } = useSesionAdmin();
  const [lista, setLista] = useState<T[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    if (!token) return;
    setError(null);
    setCargando(true);
    try {
      setLista(await listar(token));
    } catch (err) {
      setLista([]);
      setError(err instanceof Error ? err.message : 'No se pudo cargar.');
    } finally {
      setCargando(false);
    }
  }, [listar, token]);

  useEffect(() => {
    let viva = true;
    const timer = setTimeout(() => {
      if (viva) void recargar();
    }, 0);
    return () => {
      viva = false;
      clearTimeout(timer);
    };
  }, [recargar]);

  return { lista, setLista, cargando, guardando, setGuardando, error, recargar, aviso, conToken, token };
}
