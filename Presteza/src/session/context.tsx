/**
 * Contexto de sesión: quién está dentro de la app en este momento.
 *
 * Un "contexto" de React es un valor que se comparte con todas las pantallas
 * sin tener que pasarlo de una a otra por props. Aquí guardamos el usuario y
 * exponemos las tres acciones que lo cambian: entrar, registrarse y salir.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import * as api from '../api/auth';
import { setToken } from '../api/client';
import { logError, logInfo } from '../api/logger';
import type { User } from '../types';
import { readSessionToken, writeSessionToken } from './storage';

interface Session {
  /** null = nadie ha entrado. */
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    name: string,
    email: string,
    password: string,
    phone: string,
    birthDate: string,
  ) => Promise<void>;
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
  const [restaurando, setRestaurando] = useState(true);

  useEffect(() => {
    let activo = true;

    const restaurar = async () => {
      try {
        const guardado = await readSessionToken();
        if (!activo || !guardado) return;

        let usuario: User;
        try {
          usuario = api.decodificarToken(guardado);
        } catch {
          await writeSessionToken(null);
          logInfo('auth', 'Sesión guardada vencida o inválida; se requiere iniciar sesión');
          return;
        }

        setToken(guardado);
        setTokenState(guardado);
        setUser(usuario);
      } catch (error) {
        logError('auth', 'No se pudo restaurar la sesión', {
          error: error instanceof Error ? error.message : error,
        });
      } finally {
        if (activo) setRestaurando(false);
      }
    };

    void restaurar();
    return () => {
      activo = false;
    };
  }, []);

  const actualizarUsuario = useCallback((parcial: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...parcial } : prev));
  }, []);

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
    void writeSessionToken(null).catch((error: unknown) => {
      logError('auth', 'No se pudo borrar la sesión guardada', {
        error: error instanceof Error ? error.message : error,
      });
    });
  };

  const signIn = async (email: string, password: string) => {
    if (!email.trim() || !password.trim()) {
      throw new Error('Por favor completa todos los campos');
    }

    logInfo('auth', 'login iniciado', { email: email.trim().toLowerCase() });
    const session = await api.login(email, password);
    await writeSessionToken(session.token);
    setToken(session.token);
    setTokenState(session.token);
    setUser(session.user);
    logInfo('auth', 'login OK', {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
    });
  };

  return (
    <SessionContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        signIn,
        // El registro NO devuelve token, así que enseguida iniciamos sesión.
        signUp: async (name, email, password, phone, birthDate) => {
          logInfo('auth', 'registro iniciado', { email: email.trim().toLowerCase() });
          try {
            await api.register(name, email, password, phone, birthDate);
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
        actualizarUsuario,
      }}>
      {restaurando ? (
        <View className="flex-1 items-center justify-center bg-pergamino">
          <ActivityIndicator color="#3a0c20" />
          <Text className="mt-3 text-marca-oscura">Cargando sesión...</Text>
        </View>
      ) : (
        children
      )}
    </SessionContext.Provider>
  );
}
