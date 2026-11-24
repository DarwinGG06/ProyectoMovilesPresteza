import { router, type Href } from 'expo-router';
import { useState } from 'react';

import { useControlDrawerHome } from '@/features/inicio/context/ControlDrawerHome';
import { useCart } from '@/services/cart/CartContext';
import { useSession } from '@/session/context';
import { esAdmin, esRepartidor } from '@/session/roles';

export function useNavBar() {
  const { user, isAuthenticated } = useSession();
  const { totalItems } = useCart();
  const { cerrar: cerrarDrawerNativo, disponible: drawerListo } = useControlDrawerHome();
  const [loginAbierto, setLoginAbierto] = useState(false);
  const [usuarioAbierto, setUsuarioAbierto] = useState(false);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);

  const repartidor = esRepartidor(user);
  const admin = esAdmin(user);

  const abrirCuenta = () => {
    if (isAuthenticated && user) {
      setUsuarioAbierto(true);
      return;
    }
    setLoginAbierto(true);
  };

  return {
    esAdmin: admin,
    esRepartidor: repartidor,
    /** Solo entregas: sin carta, carrito ni menú lateral. */
    soloEntregas: repartidor,
    conSesion: Boolean(isAuthenticated && user),
    inicial: isAuthenticated && user?.name ? user.name.trim().charAt(0).toUpperCase() : undefined,
    totalItems: admin || repartidor ? 0 : totalItems,
    irAlInicio: () =>
      router.push((repartidor ? '/home/repartidor' : '/home') as Href),
    alternarDrawer: () => {
      if (repartidor) return;
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
    menuAbierto: repartidor ? false : menuAbierto,
    cerrarMenu: () => setMenuAbierto(false),
    abrirCuenta,
    loginAbierto,
    cerrarLogin: () => setLoginAbierto(false),
    usuarioAbierto,
    cerrarUsuario: () => setUsuarioAbierto(false),
    carritoAbierto: repartidor ? false : carritoAbierto,
    abrirCarrito: () => {
      if (admin || repartidor) return;
      setCarritoAbierto(true);
    },
    cerrarCarrito: () => setCarritoAbierto(false),
  };
}
