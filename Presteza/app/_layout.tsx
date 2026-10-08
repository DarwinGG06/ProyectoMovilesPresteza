import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ControlDrawerHomeProvider } from '@/features/inicio/context/ControlDrawerHome';
import { CartProvider } from '@/services/cart/CartContext';
import { SessionProvider } from '@/session/context';
import { AvisoProvider } from '@/shared/components/aviso';
import { WhatsAppFloat } from '@/shared/components/footer';
import { NavBar } from '@/shared/components/nav-bar';
import { useFuentes } from '@/shared/hooks/useFuentes';

import '../global.css';

export default function RootLayout() {
  const fuentesListas = useFuentes();

  if (!fuentesListas) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SessionProvider>
        <CartProvider>
          <SafeAreaProvider>
            <AvisoProvider>
              <ControlDrawerHomeProvider>
                <View className="flex-1 bg-crema">
                  <NavBar />
                  <View className="flex-1">
                    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
                      <Stack.Screen name="index" />
                      <Stack.Screen name="home" />
                    </Stack>
                  </View>
                  <WhatsAppFloat />
                  <StatusBar style="dark" />
                </View>
              </ControlDrawerHomeProvider>
            </AvisoProvider>
          </SafeAreaProvider>
        </CartProvider>
      </SessionProvider>
    </GestureHandlerRootView>
  );
}
