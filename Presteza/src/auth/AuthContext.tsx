import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type Usuario = {
  name: string;
  email: string;
  role: 'admin' | 'client';
};

type AuthContextValue = {
  user: Usuario | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login: async (email, password) => {
        if (!email.trim() || !password.trim()) {
          throw new Error('Por favor completa todos los campos');
        }

        const name = email.split('@')[0] || 'Invitado';
        setUser({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          email: email.trim(),
          role: email.toLowerCase().includes('admin') ? 'admin' : 'client',
        });
      },
      logout: () => setUser(null),
    }),
    [user],
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
