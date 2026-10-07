import { Text, View } from 'react-native';

const ITEMS = [
  { etiqueta: 'Libre', color: '#22c55e' },
  { etiqueta: 'Tu mesa', color: '#d4af77' },
  { etiqueta: 'Ocupada', color: '#e53935' },
] as const;

export function LeyendaMesas() {
  return (
    <View className="mb-4 flex-row flex-wrap justify-center gap-2">
      {ITEMS.map((item) => (
        <View key={item.etiqueta} className="flex-row items-center gap-2 rounded-full border border-oro/25 bg-white/5 px-3 py-1.5">
          <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
          <Text className="text-[11px] font-semibold text-crema/80">{item.etiqueta}</Text>
        </View>
      ))}
    </View>
  );
}
