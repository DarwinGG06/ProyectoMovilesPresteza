import { Text, View } from 'react-native';

/** Aviso nativo si el WebView del mapa no carga (sin red / error). */
export function MapaSinRed({ alto = 280 }: { alto?: number }) {
  return (
    <View
      style={{ height: alto }}
      className="items-center justify-center bg-marca-oscura px-8">
      <Text className="font-serif text-2xl text-oro">Sin conexión</Text>
      <Text className="mt-3 text-center font-roboto text-sm leading-5 text-crema/70">
        El mapa necesita internet para mostrarse. Revisa tu red e inténtalo de nuevo.
      </Text>
    </View>
  );
}
