import { useEffect } from 'react';
import type { DrawerContentComponentProps } from 'expo-router/drawer';

import { useControlDrawerHome } from '../context/ControlDrawerHome';

/**
 * Deja el menú lateral a disposición del resto de la app (el botón de la barra
 * superior lo abre desde fuera) y lo libera al desmontar.
 */
export function useRegistroDrawer(navigation: DrawerContentComponentProps['navigation']) {
  const { registrar } = useControlDrawerHome();

  useEffect(() => {
    registrar({
      abrir: () => navigation.openDrawer(),
      cerrar: () => navigation.closeDrawer(),
      alternar: () => navigation.toggleDrawer(),
    });
    return () => registrar(null);
  }, [navigation, registrar]);
}
