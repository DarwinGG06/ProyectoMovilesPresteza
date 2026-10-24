import { router } from 'expo-router';
import { useState } from 'react';

import { useControlDrawerHome } from '@/features/inicio/context/ControlDrawerHome';
import { useCart } from '@/services/cart/CartContext';
import { useSession } from '@/session/context';

export function useNavBar() {
  const { user, isAuthenticated } = useSession();
  const { totalItems } = useCart();
  const { alternar: alternarDrawerNativo, disponible: drawerListo } = useControlDrawerHome();
  const [loginAbierto, setLoginAbierto] = useState(false);
  const [usuarioAbierto, setUsuarioAbierto] = useState(false);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Con sesión abre el menú de usuario; sin ella, el modal de inicio de sesión.
  const abrirCuenta = () => {
    if (isAuthenticated && user) {
      setUsuarioAbierto(true);
      return;
    }
    setLoginAbierto(true);
  };

  return {
    inicial: isAuthenticated && user?.name ? user.name.trim().charAt(0).toUpperCase() : undefined,
    totalItems,
    irAlInicio: () => router.push('/home'),
    alternarDrawer: () => {
      if (drawerListo) {
        alternarDrawerNativo();
        return;
      }
      setMenuAbierto((abierto) => !abierto);
    },
    menuAbierto,
    cerrarMenu: () => setMenuAbierto(false),
    abrirCuenta,
    loginAbierto,
    cerrarLogin: () => setLoginAbierto(false),
    usuarioAbierto,
    cerrarUsuario: () => setUsuarioAbierto(false),
    carritoAbierto,
    abrirCarrito: () => setCarritoAbierto(true),
    cerrarCarrito: () => setCarritoAbierto(false),
  };
}
