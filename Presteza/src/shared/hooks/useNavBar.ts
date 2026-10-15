import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Platform } from 'react-native';

import { useControlDrawerHome } from '@/features/inicio/context/ControlDrawerHome';
import { useCart } from '@/services/cart/CartContext';
import { useSession } from '@/session/context';

const usarNativo = Platform.OS !== 'web';

export function useNavBar() {
  const { user, isAuthenticated } = useSession();
  const { totalItems } = useCart();
  const { alternar: alternarDrawer } = useControlDrawerHome();
  const [loginAbierto, setLoginAbierto] = useState(false);
  const [usuarioAbierto, setUsuarioAbierto] = useState(false);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const pulso = useRef(new Animated.Value(1)).current;

  // El contador del carrito late mientras haya algo dentro.
  useEffect(() => {
    if (totalItems === 0) {
      pulso.setValue(1);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulso, { toValue: 1.15, duration: 700, useNativeDriver: usarNativo }),
        Animated.timing(pulso, { toValue: 1, duration: 700, useNativeDriver: usarNativo }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulso, totalItems]);

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
    pulso,
    irAlInicio: () => router.push('/home'),
    alternarDrawer,
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
