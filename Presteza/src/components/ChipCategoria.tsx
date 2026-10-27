import { Pressable, Text, View } from 'react-native';

import { toques } from '@/theme/tokens';

type ChipCategoriaProps = {
  etiqueta: string;
  activo?: boolean;
  onPress: () => void;
};

const holgura = Math.round((toques.minimo - 24) / 2);

export function ChipCategoria({ etiqueta, activo, onPress }: ChipCategoriaProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      accessibilityState={{ selected: Boolean(activo) }}
      hitSlop={{ top: holgura, bottom: holgura, left: 8, right: 8 }}
      className="mr-4 py-1 active:opacity-70">
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
