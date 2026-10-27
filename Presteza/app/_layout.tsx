import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ControlDrawerHomeProvider } from '@/features/inicio/context/ControlDrawerHome';
import { CartProvider } from '@/services/cart/CartContext';
import { SessionProvider, useSession } from '@/session/context';
import { esAdmin } from '@/session/roles';
import { AvisoProvider } from '@/shared/components/aviso';
import { WhatsAppFloat } from '@/shared/components/footer';
import { NavBar } from '@/shared/components/nav-bar';
import { useFuentes } from '@/shared/hooks/useFuentes';

import '../global.css';

function Rutas() {
  const { user, isAuthenticated } = useSession();
  const admin = esAdmin(user);

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="home" />
      <Stack.Screen name="plato/[id]" />
      <Stack.Screen name="recuperar-contrasena" />
      <Stack.Screen name="restablecer-contrasena" />

      <Stack.Screen name="perfil" />
      <Stack.Screen name="pago" />
      <Stack.Screen name="seguimiento" />

      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="iniciar-sesion" />
        <Stack.Screen name="registro" />
      </Stack.Protected>

      <Stack.Protected guard={admin}>
        <Stack.Screen name="administracion" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const fuentesListas = useFuentes();

  if (!fuentesListas) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <CartProvider>
          <SessionProvider>
            <AvisoProvider>
              <ControlDrawerHomeProvider>
                <View className="flex-1 bg-pergamino">
                  <NavBar />
                  <View className="flex-1">
                    <Rutas />
                  </View>
                  <WhatsAppFloat />
                  <StatusBar style="dark" />
                </View>
              </ControlDrawerHomeProvider>
            </AvisoProvider>
          </SessionProvider>
        </CartProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
