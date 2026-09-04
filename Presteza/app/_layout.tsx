import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { WhatsAppFloat } from '@/shared/components/footer';

import '../global.css';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <View className="flex-1">
        <Stack screenOptions={{ headerShown: false }} />
        <WhatsAppFloat />
        <StatusBar style="auto" />
      </View>
    </SafeAreaProvider>
  );
}
