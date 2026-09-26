import { router } from 'expo-router';
import { createContext, useCallback, useContext, useMemo, useRef, type PropsWithChildren } from 'react';

type ApiDrawer = {
  abrir: () => void;
  cerrar: () => void;
  alternar: () => void;
};

type ControlDrawerHome = {
  registrar: (api: ApiDrawer | null) => void;
  abrir: () => void;
  cerrar: () => void;
  alternar: () => void;
};

const vacio: ApiDrawer = { abrir: () => {}, cerrar: () => {}, alternar: () => {} };

const DrawerHomeContext = createContext<ControlDrawerHome | null>(null);

export function ControlDrawerHomeProvider({ children }: PropsWithChildren) {
  const api = useRef<ApiDrawer>(vacio);
  const montado = useRef(false);
  const pendiente = useRef(false);

  const registrar = useCallback((siguiente: ApiDrawer | null) => {
    if (siguiente) {
      api.current = siguiente;
      montado.current = true;
      if (pendiente.current) {
        pendiente.current = false;
        requestAnimationFrame(() => siguiente.abrir());
      }
      return;
    }

    api.current = vacio;
    montado.current = false;
  }, []);

  const abrir = useCallback(() => {
    if (montado.current) {
      api.current.abrir();
      return;
    }
    pendiente.current = true;
    router.push('/home');
  }, []);

  const cerrar = useCallback(() => {
    api.current.cerrar();
  }, []);

  const alternar = useCallback(() => {
    if (montado.current) {
      api.current.alternar();
      return;
    }
    pendiente.current = true;
    router.push('/home');
  }, []);

  const value = useMemo(() => ({ registrar, abrir, cerrar, alternar }), [abrir, alternar, cerrar, registrar]);

  return <DrawerHomeContext.Provider value={value}>{children}</DrawerHomeContext.Provider>;
}

export function useControlDrawerHome() {
  const ctx = useContext(DrawerHomeContext);
  if (!ctx) {
    throw new Error('useControlDrawerHome debe usarse dentro de ControlDrawerHomeProvider');
  }
  return ctx;
}
