import { Pressable, Text, View } from 'react-native';

type ChipCategoriaProps = {
  etiqueta: string;
  activo?: boolean;
  onPress: () => void;
};

export function ChipCategoria({ etiqueta, activo, onPress }: ChipCategoriaProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      accessibilityState={{ selected: Boolean(activo) }}
      className="mr-1 min-h-12 min-w-12 justify-center px-1 active:opacity-70">
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
