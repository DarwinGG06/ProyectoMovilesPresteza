import { type Dispatch, type SetStateAction, useCallback, useEffect, useState } from 'react';

import { useSession } from '@/session/context';
import { useAviso } from '@/shared/components/aviso';

import { idDe } from '../utils';

type Identificable = { _id?: string; id?: string };

export function borrarVarios<T extends Identificable>(
  aviso: ReturnType<typeof useAviso>,
  token: string,
  setLista: Dispatch<SetStateAction<T[]>>,
  api: (token: string, id: string) => Promise<void>,
  items: T[],
  unidad: string,
  sello: string,
  opciones?: { idDe?: (item: T) => string; alTerminar?: () => void },
) {
  if (!items.length) return;
  const n = items.length;
  const extraer = opciones?.idDe ?? idDe;
  aviso.confirmar({
    sello,
    titulo: n === 1 ? `Eliminar ${unidad}` : `Eliminar ${n} ${unidad}`,
    texto: n === 1 ? '¿Eliminar este registro?' : `¿Eliminar ${n} ${unidad} de una vez?`,
    confirmar: 'ELIMINAR',
    peligro: true,
    exito: { titulo: 'Listo', texto: n === 1 ? 'Eliminado.' : `${n} eliminados.` },
    onConfirmar: async () => {
      const ids = items.map((item) => extraer(item));
      for (const id of ids) await api(token, id);
      setLista((prev) => prev.filter((item) => !ids.includes(extraer(item))));
      opciones?.alTerminar?.();
    },
  });
}

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
  const { token, aviso, conToken, user } = useSesionAdmin();
  const [lista, setLista] = useState<T[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    if (!token || user?.role !== 'admin') {
      setCargando(false);
      return;
    }
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
  }, [listar, token, user?.role]);

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
