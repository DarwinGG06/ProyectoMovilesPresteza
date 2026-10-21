import { createContext, useCallback, useContext, useMemo, useRef, useState, type PropsWithChildren } from 'react';

type ApiDrawer = {
  abrir: () => void;
  cerrar: () => void;
  alternar: () => void;
};

type ControlDrawerHome = {
  registrar: (api: ApiDrawer | null) => void;
  disponible: boolean;
  abrir: () => void;
  cerrar: () => void;
  alternar: () => void;
};

const vacio: ApiDrawer = { abrir: () => {}, cerrar: () => {}, alternar: () => {} };

const DrawerHomeContext = createContext<ControlDrawerHome | null>(null);

export function ControlDrawerHomeProvider({ children }: PropsWithChildren) {
  const api = useRef<ApiDrawer>(vacio);
  const [disponible, setDisponible] = useState(false);

  const registrar = useCallback((siguiente: ApiDrawer | null) => {
    if (siguiente) {
      api.current = siguiente;
      setDisponible(true);
      return;
    }

    api.current = vacio;
    setDisponible(false);
  }, []);

  const abrir = useCallback(() => {
    api.current.abrir();
  }, []);

  const cerrar = useCallback(() => {
    api.current.cerrar();
  }, []);

  const alternar = useCallback(() => {
    api.current.alternar();
  }, []);

  const value = useMemo(
    () => ({ registrar, disponible, abrir, cerrar, alternar }),
    [abrir, alternar, cerrar, disponible, registrar],
  );

  return <DrawerHomeContext.Provider value={value}>{children}</DrawerHomeContext.Provider>;
}

export function useControlDrawerHome() {
  const ctx = useContext(DrawerHomeContext);
  if (!ctx) {
    throw new Error('useControlDrawerHome debe usarse dentro de ControlDrawerHomeProvider');
  }
  return ctx;
}
