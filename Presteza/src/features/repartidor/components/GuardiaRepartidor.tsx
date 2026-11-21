import { useEffect, type ReactNode } from 'react';
import { usePathname, router, type Href } from 'expo-router';

import { useSession } from '@/session/context';
import { esRepartidor } from '@/session/roles';

/** Si entra a carta/perfil/etc., lo devuelve a la pantalla de entregas. */
export function GuardiaRepartidor({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useSession();
  const ruta = usePathname();

  useEffect(() => {
    if (!isAuthenticated || !esRepartidor(user)) return;
    if (ruta.includes('repartidor')) return;
    // Login/registro: no bloquear el flujo de sesión.
    if (ruta.includes('iniciar-sesion') || ruta.includes('registro')) return;
    router.replace('/home/repartidor' as Href);
  }, [isAuthenticated, ruta, user]);

  return <>{children}</>;
}
