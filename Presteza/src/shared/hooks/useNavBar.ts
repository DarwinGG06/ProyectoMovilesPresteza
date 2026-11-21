import { router } from 'expo-router';
import { useState } from 'react';

import { useControlDrawerHome } from '@/features/inicio/context/ControlDrawerHome';
import { useCart } from '@/services/cart/CartContext';
import { useSession } from '@/session/context';
import { esAdmin } from '@/session/roles';

export function useNavBar() {
  const { user, isAuthenticated } = useSession();
  const { totalItems } = useCart();
  // El NavBar vive fuera del Drawer de /home; el modal MenuDrawer cubre toda la app.
  const { cerrar: cerrarDrawerNativo, disponible: drawerListo } = useControlDrawerHome();
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
    esAdmin: esAdmin(user),
    conSesion: Boolean(isAuthenticated && user),
    inicial: isAuthenticated && user?.name ? user.name.trim().charAt(0).toUpperCase() : undefined,
    totalItems: esAdmin(user) ? 0 : totalItems,
    irAlInicio: () => router.push('/home'),
    /** Siempre el MenuDrawer modal: funciona en Menú, perfil, pago, etc. */
    alternarDrawer: () => {
      setMenuAbierto((abierto) => {
        const abrir = !abierto;
        if (abrir) {
          setCarritoAbierto(false);
          setUsuarioAbierto(false);
          setLoginAbierto(false);
          if (drawerListo) cerrarDrawerNativo();
        }
        return abrir;
      });
    },
    menuAbierto,
    cerrarMenu: () => setMenuAbierto(false),
    abrirCuenta,
    loginAbierto,
    cerrarLogin: () => setLoginAbierto(false),
    usuarioAbierto,
    cerrarUsuario: () => setUsuarioAbierto(false),
    carritoAbierto,
    abrirCarrito: () => {
      if (esAdmin(user)) return;
      setCarritoAbierto(true);
    },
    cerrarCarrito: () => setCarritoAbierto(false),
  };
}
