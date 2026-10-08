import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { formatCOP } from '@/services/cart/CartContext';

import type { StatsAdmin } from '../types';

type HeroAdminProps = {
  nombre: string;
  stats: StatsAdmin;
};

export function HeroAdmin({ nombre, stats }: HeroAdminProps) {
  const entrada = useSharedValue(0);

  useEffect(() => {
    entrada.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
  }, [entrada]);

  const cifra = useAnimatedStyle(() => ({
    opacity: entrada.value,
    transform: [{ translateY: (1 - entrada.value) * 14 }],
  }));

  return (
    <View className="overflow-hidden bg-marca-oscura px-6 pb-8 pt-7">
      <View
        pointerEvents="none"
        className="absolute -right-16 top-4 h-52 w-52 rounded-full border-[28px] border-oro/10"
      />
      <View
        pointerEvents="none"
        className="absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-marca/50"
      />

      <Text className="font-roboto text-[10px] tracking-[3px] text-oro">ADMINISTRACIÓN</Text>
      <Text className="mt-2 font-roboto text-sm text-crema/70">{nombre}</Text>

      <Animated.View style={cifra}>
        <Text className="mt-6 font-roboto text-[11px] tracking-[3px] text-crema/70">INGRESOS</Text>
        <Text className="mt-1 font-roboto-light text-[42px] leading-[46px] text-white">
          {formatCOP(stats.totalRevenue)}
        </Text>
      </Animated.View>

      <View className="mt-6 flex-row">
        <View className="mr-8">
          <Text className="font-roboto-light text-[28px] text-oro">{stats.pendingOrders}</Text>
          <Text className="font-roboto text-[10px] tracking-[2px] text-crema/60">
            PEDIDOS PENDIENTES
          </Text>
        </View>
        <View className="mr-8">
          <Text className="font-roboto-light text-[28px] text-white">
            {stats.pendingReservations}
          </Text>
          <Text className="font-roboto text-[10px] tracking-[2px] text-crema/60">
            RESERVAS PENDIENTES
          </Text>
        </View>
        <View>
          <Text className="font-roboto-light text-[28px] text-white">{stats.unreadMessages}</Text>
          <Text className="font-roboto text-[10px] tracking-[2px] text-crema/60">
            MENSAJES NUEVOS
          </Text>
        </View>
      </View>
    </View>
  );
}
