import { router } from 'expo-router';
import { useState } from 'react';

/** Acciones de la pantalla de perfil cuando todavía no hay sesión. */
export function useInvitado() {
  const [loginAbierto, setLoginAbierto] = useState(false);

  return {
    loginAbierto,
    abrirLogin: () => setLoginAbierto(true),
    cerrarLogin: () => setLoginAbierto(false),
    irARegistro: () => router.push('/registro'),
    irAlInicio: () => router.push('/'),
  };
}
