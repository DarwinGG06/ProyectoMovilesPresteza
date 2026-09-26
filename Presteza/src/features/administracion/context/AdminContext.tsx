import { createContext, useContext, type PropsWithChildren } from 'react';

import { useAdmin } from '@/features/administracion/hooks/useAdmin';

type AdminContextValue = ReturnType<typeof useAdmin>;

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: PropsWithChildren) {
  const admin = useAdmin();
  return <AdminContext.Provider value={admin}>{children}</AdminContext.Provider>;
}

export function useAdminContext() {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error('useAdminContext debe usarse dentro de AdminProvider');
  }
  return ctx;
}
