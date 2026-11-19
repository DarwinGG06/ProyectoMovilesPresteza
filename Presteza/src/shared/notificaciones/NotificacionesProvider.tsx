import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  borrarPushToken,
  listarNotificaciones,
  marcarNotificacionLeida,
  marcarTodasNotificacionesLeidas,
  registrarPushToken,
  type Notificacion,
} from '@/api/notificaciones';
import { useSession } from '@/session/context';

import {
  escucharPushRecibido,
  escucharToquePush,
  obtenerExpoPushToken,
  type PayloadPush,
} from './push';
import { avisarCambioCumpleanios } from './cumpleanios';
import { useAvisoCumpleanios } from './useAvisoCumpleanios';
import { useNavegacionAvisos } from './useNavegacionAvisos';

// Las rutas /notifications ya existen en el backend (necesita supabase-notifications.sql).
const API_NOTIFICACIONES_HABILITADA = true;

type Api = {
  items: Notificacion[];
  unread: number;
  abierta: boolean;
  toast: Notificacion | null;
  abrir: () => void;
  cerrar: () => void;
  refrescar: () => Promise<void>;
  leer: (id: string) => Promise<void>;
  leerTodas: () => Promise<void>;
  cerrarToast: () => void;
};

const Ctx = createContext<Api | null>(null);

export function NotificacionesProvider({ children }: { children: ReactNode }) {
  useAvisoCumpleanios();
  useNavegacionAvisos();
  const { token, isAuthenticated } = useSession();
  const [items, setItems] = useState<Notificacion[]>([]);
  const [unread, setUnread] = useState(0);
  const [abierta, setAbierta] = useState(false);
  const [toast, setToast] = useState<Notificacion | null>(null);
  const vistos = useRef<Set<string>>(new Set());
  const listo = useRef(false);
  const pushEnviado = useRef<string | null>(null);
  // Con qué sesión quedó registrado el push token, para soltarlo al cerrar sesión.
  const pushRegistrado = useRef<{ jwt: string; pushToken: string } | null>(null);
  const sesion = useRef({ token });
  sesion.current = { token };

  const refrescar = useCallback(async () => {
    if (!API_NOTIFICACIONES_HABILITADA || !token || !isAuthenticated) {
      setItems([]);
      setUnread(0);
      return;
    }
    try {
      const data = await listarNotificaciones(token);
      setItems(data.items);
      setUnread(data.unread);

      if (!listo.current) {
        data.items.forEach((item) => vistos.current.add(item.id));
        listo.current = true;
        return;
      }

      const nuevas = data.items.filter((item) => !item.readAt && !vistos.current.has(item.id));
      data.items.forEach((item) => vistos.current.add(item.id));
      if (nuevas[0]) setToast(nuevas[0]);
    } catch {
      // El endpoint puede no estar desplegado todavía.
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    listo.current = false;
    vistos.current = new Set();
    pushEnviado.current = null;
    void refrescar();
  }, [refrescar]);

  useEffect(() => {
    if (!API_NOTIFICACIONES_HABILITADA || !isAuthenticated || !token) return;

    const timer = setInterval(() => void refrescar(), 8000);

    return () => clearInterval(timer);
  }, [isAuthenticated, refrescar, token]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5200);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!isAuthenticated || !token) return;
    let vivo = true;
    (async () => {
      const pushToken = await obtenerExpoPushToken();
      if (vivo) avisarCambioCumpleanios();
      if (!API_NOTIFICACIONES_HABILITADA) return;
      if (!vivo || !pushToken || pushEnviado.current === pushToken) return;
      try {
        await registrarPushToken(token, pushToken);
        pushEnviado.current = pushToken;
        pushRegistrado.current = { jwt: token, pushToken };
      } catch {
        // Sin columna/endpoint aún: la campanita en app sigue.
      }
    })();
    return () => {
      vivo = false;
    };
  }, [isAuthenticated, token]);

  // Al cerrar sesión, el celular deja de recibir los push de esa cuenta.
  // Si no, quien entre después en el mismo celular vería los pedidos del anterior.
  useEffect(() => {
    if (token) return;
    const registrado = pushRegistrado.current;
    if (!registrado) return;
    pushRegistrado.current = null;
    void borrarPushToken(registrado.jwt).catch(() => {
      // Si falla, el backend igual mueve el token cuando otra cuenta lo registre.
    });
  }, [token]);

  /**
   * Toque en un push: aquí solo se marca el aviso como leído.
   * La navegación (deep link a `/seguimiento?id=...`, incluso con la app
   * cerrada o sin sesión) la hace `useNavegacionAvisos`, en un solo lugar.
   */
  const marcarTocado = useCallback(
    (payload: PayloadPush) => {
      const jwt = sesion.current.token;
      if (!API_NOTIFICACIONES_HABILITADA || !payload.id || !jwt) return;
      vistos.current.add(payload.id);
      void marcarNotificacionLeida(jwt, payload.id)
        .then(() => refrescar())
        .catch(() => undefined);
    },
    [refrescar],
  );

  useEffect(() => {
    const recibido = escucharPushRecibido((payload) => {
      if (payload.id) vistos.current.add(payload.id);
      void refrescar();
    });
    const toque = escucharToquePush(marcarTocado);
    return () => {
      recibido.remove();
      toque.remove();
    };
  }, [marcarTocado, refrescar]);

  const leer = useCallback(
    async (id: string) => {
      if (!API_NOTIFICACIONES_HABILITADA || !token) return;
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, readAt: item.readAt || new Date().toISOString() } : item
        )
      );
      setUnread((prev) => Math.max(0, prev - 1));
      try {
        await marcarNotificacionLeida(token, id);
      } catch {
        void refrescar();
      }
    },
    [refrescar, token]
  );

  const leerTodas = useCallback(async () => {
    if (!API_NOTIFICACIONES_HABILITADA || !token) return;
    setItems((prev) =>
      prev.map((item) => ({ ...item, readAt: item.readAt || new Date().toISOString() }))
    );
    setUnread(0);
    try {
      await marcarTodasNotificacionesLeidas(token);
    } catch {
      void refrescar();
    }
  }, [refrescar, token]);

  const api = useMemo<Api>(
    () => ({
      items,
      unread,
      abierta,
      toast,
      abrir: () => {
        setAbierta(true);
        void refrescar();
      },
      cerrar: () => setAbierta(false),
      refrescar,
      leer,
      leerTodas,
      cerrarToast: () => setToast(null),
    }),
    [abierta, items, leer, leerTodas, refrescar, toast, unread]
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useNotificaciones() {
  const api = useContext(Ctx);
  if (!api) {
    throw new Error('useNotificaciones necesita NotificacionesProvider');
  }
  return api;
}
