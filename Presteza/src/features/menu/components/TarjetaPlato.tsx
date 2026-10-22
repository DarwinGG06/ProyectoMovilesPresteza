import { Image, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { idDe } from '@/api/helpers';
import { SelloP } from '@/shared/components/nav-bar/SelloP';
import type { Producto } from '@/types';

type TarjetaPlatoProps = {
  producto: Producto;
  indice: number;
  tieneModelo?: boolean;
  onVerModelo?: () => void;
};

/** Línea de carta: nombre en serifa, precio en vino, foto contenida. */
export function TarjetaPlato({ producto, indice, tieneModelo, onVerModelo }: TarjetaPlatoProps) {
  const precio = (Number(producto.price) || 0).toLocaleString('es-CO');
  const id = idDe(producto);

  return (
    <Pressable
      onPress={() => id && router.push({ pathname: '/plato/[id]', params: { id } })}
      accessibilityRole="button"
      accessibilityLabel={`Ver ${producto.name}`}
      className="flex-row items-start border-b border-madera/20 py-5 active:opacity-80">
      <Text className="mt-1 w-8 font-roboto text-[10px] tracking-[1px] text-marca">
        {String(indice + 1).padStart(2, '0')}
      </Text>

      <View className="relative mr-4 h-20 w-20">
        {producto.imageUrl ? (
          <Image
            source={{ uri: producto.imageUrl }}
            className="h-full w-full bg-madera/10"
            resizeMode="cover"
          />
        ) : (
          <View className="h-full w-full items-center justify-center bg-madera/10">
            <SelloP size="sm" />
          </View>
        )}
        {tieneModelo ? (
          <Pressable
            onPress={(evento) => {
              evento.stopPropagation();
              onVerModelo?.();
            }}
            accessibilityRole="button"
            accessibilityLabel={`Ver ${producto.name} en 3D`}
            className="absolute -bottom-1 -right-1 border border-oro bg-marca-oscura p-1.5 active:opacity-80">
            <Ionicons name="cube-outline" size={14} color="#d4af77" />
          </Pressable>
        ) : null}
      </View>

      <View className="min-w-0 flex-1">
        <Text className="font-serif-semibold text-[22px] leading-6 text-tinta">
          {producto.name}
        </Text>
        {producto.description ? (
          <Text className="mt-1 font-roboto text-[13px] leading-5 text-tinta/70" numberOfLines={2}>
            {producto.description}
          </Text>
        ) : null}
        <Text className="mt-2 font-roboto text-[12px] tracking-[1px] text-marca">${precio}</Text>
      </View>
    </Pressable>
  );
}
