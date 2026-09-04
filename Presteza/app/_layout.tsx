import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/auth/AuthContext';
import { CartProvider } from '@/services/cart/CartContext';
import { WhatsAppFloat } from '@/shared/components/footer';
import { NavBar } from '@/shared/components/nav-bar';

import '../global.css';

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <SafeAreaProvider>
          <View className="flex-1 bg-crema">
            <NavBar />
            <View className="flex-1">
              <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
            </View>
            <WhatsAppFloat />
            <StatusBar style="dark" />
          </View>
        </SafeAreaProvider>
      </CartProvider>
    </AuthProvider>
  );
}
