import { Animated, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useNavBar } from '@/shared/hooks/useNavBar';

import { CartSheet } from './CartSheet';
import { IconoNav } from './IconoNav';
import { LoginModal } from './LoginModal';
import { MenuDrawer } from './MenuDrawer';
import { UserMenu } from './UserMenu';

export function NavBar() {
  const nav = useNavBar();

  return (
    <View className="bg-pergamino">
      <SafeAreaView edges={['top']}>
        <View className="flex-row items-center px-6 pb-3 pt-1">
          <Pressable onPress={nav.irAlInicio} className="flex-1">
            <Text className="font-serif text-[18px] tracking-[6px] text-tinta">PRESTEZA</Text>
            <Text className="mt-0.5 font-roboto text-[9px] tracking-[2px] text-marca">
              MANIZALES
            </Text>
          </Pressable>

          <View className="flex-row items-center">
            <BotonBarra icono="person-outline" inicial={nav.inicial} onPress={nav.abrirCuenta} />
            <View>
              <BotonBarra icono="bag-handle-outline" onPress={nav.abrirCarrito} />
              {nav.totalItems > 0 ? (
                <Animated.View
                  style={{ transform: [{ scale: nav.pulso }] }}
                  className="absolute right-0.5 top-0.5 min-h-[14px] min-w-[14px] items-center justify-center bg-marca px-1">
                  <Text className="font-roboto text-[8px] text-pergamino">{nav.totalItems}</Text>
                </Animated.View>
              ) : null}
            </View>
            <BotonBarra icono="menu" onPress={nav.alternarDrawer} />
          </View>
        </View>
        <View className="h-px bg-madera/15" />
      </SafeAreaView>

      <LoginModal visible={nav.loginAbierto} onClose={nav.cerrarLogin} />
      <UserMenu visible={nav.usuarioAbierto} onClose={nav.cerrarUsuario} />
      <CartSheet visible={nav.carritoAbierto} onClose={nav.cerrarCarrito} />
      <MenuDrawer visible={nav.menuAbierto} onClose={nav.cerrarMenu} />
    </View>
  );
}

function BotonBarra({
  icono,
  inicial,
  onPress,
}: {
  icono: 'person-outline' | 'bag-handle-outline' | 'menu';
  inicial?: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="h-10 w-10 items-center justify-center">
      {inicial ? (
        <Text className="font-serif text-[15px] text-marca">{inicial}</Text>
      ) : (
        <IconoNav name={icono} size={18} className="text-marca" />
      )}
    </Pressable>
  );
}
