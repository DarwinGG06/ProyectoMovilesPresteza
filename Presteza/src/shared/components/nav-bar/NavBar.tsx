import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PanelNotificaciones } from '@/shared/components/notificaciones/PanelNotificaciones';
import { useNavBar } from '@/shared/hooks/useNavBar';
import { useNotificaciones } from '@/shared/notificaciones/NotificacionesProvider';

import { CartSheet } from './CartSheet';
import { IconoNav } from './IconoNav';
import { LoginModal } from './LoginModal';
import { MenuDrawer } from './MenuDrawer';
import { UserMenu } from './UserMenu';

export function NavBar() {
  const nav = useNavBar();
  const avisos = useNotificaciones();

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
            {nav.conSesion ? (
              <View>
                <Pressable
                  onPress={avisos.abrir}
                  accessibilityRole="button"
                  accessibilityLabel="Avisos"
                  className="min-h-12 min-w-12 items-center justify-center">
                  <View
                    className={`h-9 w-9 items-center justify-center border ${
                      avisos.unread > 0 ? 'border-oro bg-marca-oscura' : 'border-transparent'
                    }`}>
                    <IconoNav
                      name={avisos.unread > 0 ? 'notifications' : 'notifications-outline'}
                      size={18}
                      color={avisos.unread > 0 ? '#d4af77' : '#6b1d3d'}
                    />
                  </View>
                </Pressable>
                {avisos.unread > 0 ? (
                  <View className="absolute right-0 top-1 h-[18px] min-w-[18px] items-center justify-center rounded-full bg-marca px-1">
                    <Text className="text-center font-roboto text-[10px] leading-[12px] text-crema">
                      {avisos.unread > 9 ? '9+' : avisos.unread}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : null}
            <BotonBarra
              icono="person-outline"
              etiqueta="Cuenta"
              inicial={nav.inicial}
              onPress={nav.abrirCuenta}
            />
            {nav.esAdmin ? null : (
              <View>
                <BotonBarra icono="bag-handle-outline" etiqueta="Bandeja" onPress={nav.abrirCarrito} />
                {nav.totalItems > 0 ? (
                  <View className="absolute right-0 top-1 h-[18px] min-w-[18px] items-center justify-center rounded-full bg-marca px-1">
                    <Text className="text-center font-roboto text-[10px] leading-[12px] text-crema">
                      {nav.totalItems > 9 ? '9+' : nav.totalItems}
                    </Text>
                  </View>
                ) : null}
              </View>
            )}
            <BotonBarra icono="menu" etiqueta="Menú" onPress={nav.alternarDrawer} />
          </View>
        </View>
        <View className="h-px bg-madera/15" />
      </SafeAreaView>

      <LoginModal visible={nav.loginAbierto} onClose={nav.cerrarLogin} />
      <UserMenu visible={nav.usuarioAbierto} onClose={nav.cerrarUsuario} />
      <CartSheet visible={nav.carritoAbierto} onClose={nav.cerrarCarrito} />
      <MenuDrawer visible={nav.menuAbierto} onClose={nav.cerrarMenu} />
      <PanelNotificaciones />
    </View>
  );
}

function BotonBarra({
  icono,
  etiqueta,
  inicial,
  onPress,
}: {
  icono: 'person-outline' | 'bag-handle-outline' | 'menu';
  etiqueta: string;
  inicial?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      className="min-h-12 min-w-12 items-center justify-center">
      {inicial ? (
        <Text className="font-serif text-[15px] text-marca">{inicial}</Text>
      ) : (
        <IconoNav name={icono} size={18} className="text-marca" />
      )}
    </Pressable>
  );
}
