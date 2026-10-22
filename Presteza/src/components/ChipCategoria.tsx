import { Pressable, Text, View } from 'react-native';

type ChipCategoriaProps = {
  etiqueta: string;
  activo?: boolean;
  onPress: () => void;
};

export function ChipCategoria({ etiqueta, activo, onPress }: ChipCategoriaProps) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" className="mr-1 py-2 active:opacity-70">
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
