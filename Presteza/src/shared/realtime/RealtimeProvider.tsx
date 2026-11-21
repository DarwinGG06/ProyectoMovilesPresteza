import { useEffect, type ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';

import { API_URL } from '@/api/config';
import { useSession } from '@/session/context';

import {
  emitirAvisoRealtime,
  emitirPedidoRealtime,
  emitirReservaRealtime,
} from './eventos';

/** Conecta al namespace /realtime del Nest y reemite eventos locales. */
export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated } = useSession();

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    let socket: Socket | null = null;
    try {
      socket = io(`${API_URL}/realtime`, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1500,
      });

      socket.on('pedido', (payload) => emitirPedidoRealtime(payload));
      socket.on('reserva', (payload) => emitirReservaRealtime(payload));
      socket.on('aviso', (payload) => emitirAvisoRealtime(payload));
      socket.on('connect_error', () => {
        // Si el WS no está disponible, el poll de 3 s sigue como respaldo.
      });
    } catch {
      // Sin socket.io el poll cubre la sync.
    }

    return () => {
      socket?.removeAllListeners();
      socket?.disconnect();
    };
  }, [isAuthenticated, token]);

  return <>{children}</>;
}
