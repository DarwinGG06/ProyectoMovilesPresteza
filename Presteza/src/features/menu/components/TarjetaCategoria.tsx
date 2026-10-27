import { Image, Pressable, Text, View } from 'react-native';

import { SelloP } from '@/shared/components/nav-bar/SelloP';

export type PortadaCategoria = {
  id: string;
  name: string;
  count: number;
  imageUrl?: string;
};

export function TarjetaCategoria({
  portada,
  onPress,
}: {
  portada: PortadaCategoria;
  onPress: () => void;
}) {
  const platos = portada.count === 1 ? '1 plato' : `${portada.count} platos`;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${portada.name}, ${platos}`}
      className="mb-6 w-[48%] active:opacity-80">
      <View className="h-36 overflow-hidden bg-madera/10">
        {portada.imageUrl ? (
          <Image source={{ uri: portada.imageUrl }} className="h-full w-full" resizeMode="cover" />
        ) : (
          <View className="h-full w-full items-center justify-center">
            <SelloP size="sm" />
          </View>
        )}
      </View>
      <Text className="mt-3 font-serif-semibold text-[20px] leading-6 text-tinta" numberOfLines={2}>
        {portada.name}
      </Text>
      <Text className="mt-1 font-roboto text-[10px] tracking-[2px] text-marca">
        {platos.toUpperCase()}
      </Text>
      <View className="mt-2 h-px w-8 bg-marca/40" />
    </Pressable>
  );
}
