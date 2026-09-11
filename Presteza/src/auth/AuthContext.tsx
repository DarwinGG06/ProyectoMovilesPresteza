import React, { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { decodificarToken, loginApi, registerApi, type RegistroDatos } from './authApi';

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

        const respuesta = await loginApi(email, password);
        const jwt = respuesta.user;
        if (!jwt || typeof jwt !== 'string') {
          throw new Error('El servidor no devolvió un token válido');
        }

        setToken(jwt);
        setUser(decodificarToken(jwt));
      },
      register: async (datos) => {
        await registerApi(datos);
        try {
          const respuesta = await loginApi(datos.email, datos.password);
          const jwt = respuesta.user;
          if (jwt && typeof jwt === 'string') {
            setToken(jwt);
            setUser(decodificarToken(jwt));
          }
        } catch {
        }
      },
      logout: () => {
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
