import React, { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { logError, logInfo } from '@/services/api/logger';

import { decodificarToken, extraerJwt, loginApi, registerApi, type RegistroDatos } from './authApi';

export type Usuario = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'client';
};

type AuthContextValue = {
  user: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (datos: RegistroDatos) => Promise<void>;
  actualizarUsuario: (parcial: Partial<Usuario>) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      login: async (email, password) => {
        if (!email.trim() || !password.trim()) {
          throw new Error('Por favor completa todos los campos');
        }

        logInfo('auth', 'login iniciado', { email: email.trim().toLowerCase() });
        const respuesta = await loginApi(email, password);
        const jwt = extraerJwt(respuesta);
        if (!jwt) {
          logError('auth', 'login sin JWT', { keys: Object.keys(respuesta ?? {}) });
          throw new Error('El servidor no devolvió un token válido');
        }

        const usuario = decodificarToken(jwt);
        setToken(jwt);
        setUser(usuario);
        logInfo('auth', 'login OK', { id: usuario.id, email: usuario.email, role: usuario.role });
      },
      register: async (datos) => {
        logInfo('auth', 'registro iniciado', { email: datos.email.trim().toLowerCase() });
        const creado = await registerApi(datos);
        logInfo('auth', 'registro OK, iniciando sesión', { userId: creado.userId });

        const respuesta = await loginApi(datos.email, datos.password);
        const jwt = extraerJwt(respuesta);
        if (!jwt) {
          logError('auth', 'cuenta creada pero login no devolvió JWT', {
            keys: Object.keys(respuesta ?? {}),
          });
          throw new Error('Cuenta creada, pero el servidor no devolvió un token válido');
        }

        const usuario = decodificarToken(jwt);
        setToken(jwt);
        setUser(usuario);
        logInfo('auth', 'registro + login OK', { id: usuario.id, email: usuario.email });
      },
      actualizarUsuario: (parcial) => {
        setUser((prev) => (prev ? { ...prev, ...parcial } : prev));
      },
      logout: () => {
        logInfo('auth', 'logout', { email: user?.email ?? null });
        setUser(null);
        setToken(null);
      },
    }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
