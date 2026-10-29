import { Pressable, Text, View } from 'react-native';

import { toques } from '@/theme/tokens';

type ChipCategoriaProps = {
  etiqueta: string;
  activo?: boolean;
  disabled?: boolean;
  onPress: () => void;
};

const holgura = Math.round((toques.minimo - 24) / 2);

export function ChipCategoria({ etiqueta, activo, onPress, disabled }: ChipCategoriaProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.96 : 1 }] })}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      accessibilityState={{ selected: Boolean(activo), disabled: Boolean(disabled) }}
      hitSlop={{ top: holgura, bottom: holgura, left: 8, right: 8 }}
      className={`mr-4 min-h-12 justify-center py-1 ${disabled ? 'border-b border-dashed border-madera bg-pergamino-oscuro' : ''}`}>
      <Text
        className={`font-roboto text-[10px] tracking-[2px] ${
          activo ? 'text-tinta' : 'text-tinta/70'
        }`}>
        {etiqueta.toUpperCase()}
      </Text>
      <View className={`mt-1.5 h-px w-8 ${activo ? 'bg-marca' : 'bg-transparent'}`} />
    </Pressable>
  );
}
