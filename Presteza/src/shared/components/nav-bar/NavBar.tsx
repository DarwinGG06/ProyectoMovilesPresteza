import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, Text, View } from 'react-native';

const usarNativo = Platform.OS !== 'web';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/session/context';
import { useCart } from '@/services/cart/CartContext';

import { CartSheet } from './CartSheet';
import { IconoNav } from './IconoNav';
import { LoginModal } from './LoginModal';
import { MenuDrawer } from './MenuDrawer';
import { SelloP } from './SelloP';
import { UserMenu } from './UserMenu';

export function NavBar() {
  const { user, isAuthenticated } = useSession();
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const pulso = useRef(new Animated.Value(1)).current;

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

  return (
    <View className="bg-crema">
      <SafeAreaView edges={['top']}>
        <View className="px-4 pb-3 pt-1">
          <View className="flex-row items-center rounded-full bg-marca-oscura px-2 py-2 shadow-xl">
            <Pressable onPress={() => router.push('/')} className="flex-row items-center gap-2 pl-1">
              <SelloP size="sm" />
              <View>
                <Text className="text-lg font-extrabold tracking-[4px] text-crema">PRESTEZA</Text>
                <Text className="-mt-0.5 text-[9px] tracking-[2px] text-oro">MANIZALES</Text>
              </View>
            </Pressable>

            <View className="ml-auto flex-row items-center gap-1.5 pr-1">
              <BotonIsla
                icono="person-outline"
                inicial={isAuthenticated && user?.name ? user.name.trim().charAt(0).toUpperCase() : undefined}
                onPress={() => (isAuthenticated && user ? setUserOpen(true) : setLoginOpen(true))}
              />
              <View>
                <BotonIsla icono="bag-handle-outline" onPress={() => setCartOpen(true)} />
                {totalItems > 0 ? (
                  <Animated.View
                    style={{ transform: [{ scale: pulso }] }}
                    className="absolute -right-0.5 -top-0.5 min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-oro px-1">
                    <Text className="text-[9px] font-extrabold text-marca-oscura">{totalItems}</Text>
                  </Animated.View>
                ) : null}
              </View>
              <BotonIsla icono="menu" destacado onPress={() => setMenuOpen(true)} />
            </View>
          </View>
        </View>
      </SafeAreaView>

      <MenuDrawer visible={menuOpen} onClose={() => setMenuOpen(false)} />
      <LoginModal visible={loginOpen} onClose={() => setLoginOpen(false)} />
      <UserMenu visible={userOpen} onClose={() => setUserOpen(false)} />
      <CartSheet visible={cartOpen} onClose={() => setCartOpen(false)} />
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
