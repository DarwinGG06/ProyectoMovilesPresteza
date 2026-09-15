/**
 * Contexto de sesión: quién está dentro de la app en este momento.
 *
 * Un "contexto" de React es un valor que se comparte con todas las pantallas
 * sin tener que pasarlo de una a otra por props. Aquí guardamos el usuario y
 * exponemos las tres acciones que lo cambian: entrar, registrarse y salir.
 */

import React, { createContext, useContext, useState, type PropsWithChildren } from 'react';

import * as api from '../api/auth';
import { setToken } from '../api/client';
import { logError, logInfo } from '../api/logger';
import type { User } from '../types';

interface Session {
  /** null = nadie ha entrado. */
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string, phone: string) => Promise<void>;
  signOut: () => void;
  logout: () => void;
  actualizarUsuario: (parcial: Partial<User>) => void;
}

const SessionContext = createContext<Session | null>(null);

/** Atajo para leer la sesión desde cualquier pantalla: `const { user } = useSession()`. */
export function useSession(): Session {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession debe usarse dentro de <SessionProvider />');
  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);

  /**
   * Pide el token al backend y lo deja disponible para las siguientes
   * peticiones. Si las credenciales son malas, `api.login` lanza el error del
   * servidor y la pantalla de login lo muestra: aquí no se atrapa.
   */
  const salir = () => {
    logInfo('auth', 'logout', { email: user?.email ?? null });
    setToken(null);
    setTokenState(null);
    setUser(null);
  };

  const signIn = async (email: string, password: string) => {
    if (!email.trim() || !password.trim()) {
      throw new Error('Por favor completa todos los campos');
    }

    logInfo('auth', 'login iniciado', { email: email.trim().toLowerCase() });
    const session = await api.login(email, password);
    setToken(session.token);
    setTokenState(session.token);
    setUser(session.user);
    logInfo('auth', 'login OK', { id: session.user.id, email: session.user.email, role: session.user.role });
  };

  return (
    <SessionContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        signIn,
        // El registro NO devuelve token, así que enseguida iniciamos sesión.
        signUp: async (name, email, password, phone) => {
          logInfo('auth', 'registro iniciado', { email: email.trim().toLowerCase() });
          try {
            await api.register(name, email, password, phone);
          } catch (error) {
            logError('auth', 'registro falló', {
              error: error instanceof Error ? error.message : error,
            });
            throw error;
          }
          await signIn(email, password);
        },
        signOut: salir,
        logout: salir,
        actualizarUsuario: (parcial) => {
          setUser((prev) => (prev ? { ...prev, ...parcial } : prev));
        },
      }}>
      {children}
    </SessionContext.Provider>
  );
}
