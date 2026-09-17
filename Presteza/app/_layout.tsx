import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CartProvider } from '@/services/cart/CartContext';
import { SessionProvider } from '@/session/context';
import { AvisoProvider } from '@/shared/components/aviso';
import { WhatsAppFloat } from '@/shared/components/footer';
import { NavBar } from '@/shared/components/nav-bar';

import '../global.css';

export default function RootLayout() {
  return (
    <SessionProvider>
      <CartProvider>
        <SafeAreaProvider>
          <AvisoProvider>
            <View className="flex-1 bg-crema">
              <NavBar />
              <View className="flex-1">
                <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
              </View>
              <WhatsAppFloat />
              <StatusBar style="dark" />
            </View>
          </AvisoProvider>
        </SafeAreaProvider>
      </CartProvider>
    </SessionProvider>
  );
}
