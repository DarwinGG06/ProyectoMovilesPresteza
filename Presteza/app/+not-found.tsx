import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-crema px-6">
      <Text className="text-center text-3xl text-marca-oscura">Página no encontrada</Text>
      <Text className="mt-3 text-center text-base text-texto/70">
        Este enlace no está disponible. Puedes volver al inicio para continuar.
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.replace('/home')}
        className="mt-6 bg-marca-oscura px-6 py-3">
        <Text className="text-crema">VOLVER AL INICIO</Text>
      </Pressable>
    </View>
  );
}
