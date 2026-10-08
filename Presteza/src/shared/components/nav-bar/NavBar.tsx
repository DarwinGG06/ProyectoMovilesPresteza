import { Animated, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useNavBar } from '@/shared/hooks/useNavBar';

import { CartSheet } from './CartSheet';
import { IconoNav } from './IconoNav';
import { LoginModal } from './LoginModal';
import { SelloP } from './SelloP';
import { UserMenu } from './UserMenu';

export function NavBar() {
  const nav = useNavBar();

  return (
    <View className="bg-crema">
      <SafeAreaView edges={['top']}>
        <View className="px-4 pb-3 pt-1">
          <View className="flex-row items-center rounded-full bg-marca-oscura px-2 py-2 shadow-xl">
            <Pressable onPress={nav.irAlInicio} className="flex-row items-center gap-2 pl-1">
              <SelloP size="sm" />
              <View>
                <Text className="text-lg font-extrabold tracking-[4px] text-crema">PRESTEZA</Text>
                <Text className="-mt-0.5 text-[9px] tracking-[2px] text-oro">MANIZALES</Text>
              </View>
            </Pressable>

            <View className="ml-auto flex-row items-center gap-1.5 pr-1">
              <BotonIsla icono="person-outline" inicial={nav.inicial} onPress={nav.abrirCuenta} />
              <View>
                <BotonIsla icono="bag-handle-outline" onPress={nav.abrirCarrito} />
                {nav.totalItems > 0 ? (
                  <Animated.View
                    style={{ transform: [{ scale: nav.pulso }] }}
                    className="absolute -right-0.5 -top-0.5 min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-oro px-1">
                    <Text className="text-[9px] font-extrabold text-marca-oscura">{nav.totalItems}</Text>
                  </Animated.View>
                ) : null}
              </View>
              <BotonIsla icono="menu" destacado onPress={nav.alternarDrawer} />
            </View>
          </View>
        </View>
      </SafeAreaView>

      <LoginModal visible={nav.loginAbierto} onClose={nav.cerrarLogin} />
      <UserMenu visible={nav.usuarioAbierto} onClose={nav.cerrarUsuario} />
      <CartSheet visible={nav.carritoAbierto} onClose={nav.cerrarCarrito} />
    </View>
  );
}

function BotonIsla({
  icono,
  inicial,
  onPress,
  destacado = false,
}: {
  icono: 'person-outline' | 'bag-handle-outline' | 'menu';
  inicial?: string;
  onPress: () => void;
  destacado?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`h-10 w-10 items-center justify-center rounded-full ${
        destacado ? 'bg-oro' : 'border border-oro/40 bg-white/5'
      }`}>
      {inicial ? (
        <Text className={`text-[15px] font-semibold ${destacado ? 'text-marca-oscura' : 'text-oro'}`}>{inicial}</Text>
      ) : (
        <IconoNav name={icono} size={18} className={destacado ? 'text-marca-oscura' : 'text-oro'} />
      )}
    </Pressable>
  );
}
