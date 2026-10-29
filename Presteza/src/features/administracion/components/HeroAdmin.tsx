import { Pressable, Text, View } from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';

import { formatCOP } from '@/services/cart/CartContext';

import type { PedidoAdmin, StatsAdmin } from '../types';

type HeroAdminProps = {
  stats: StatsAdmin;
  pedidos: PedidoAdmin[];
  onPress: () => void;
};

function Sparkline({ valores }: { valores: number[] }) {
  const serie = valores.length > 1 ? valores.slice(-8) : [4, 6, 5, 8, 7, 10, 9, 12];
  const ancho = 92;
  const alto = 40;
  const max = Math.max(...serie, 1);
  const min = Math.min(...serie);
  const puntos = serie
    .map((valor, index) => {
      const x = (index / (serie.length - 1)) * ancho;
      const y = alto - 6 - ((valor - min) / (max - min || 1)) * (alto - 12);
      return `${x},${y}`;
    })
    .join(' ');
  const ultimo = puntos.split(' ').at(-1)?.split(',') ?? ['0', '0'];

  return (
    <Svg width={ancho} height={alto}>
      <Polyline points={puntos} fill="none" stroke="#d4af77" strokeWidth={1.6} />
      <Circle cx={Number(ultimo[0])} cy={Number(ultimo[1])} r={2.4} fill="#d4af77" />
    </Svg>
  );
}

export function HeroAdmin({ stats, pedidos, onPress }: HeroAdminProps) {
  const curva = [...pedidos]
    .sort((a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime())
    .map((pedido) => pedido.total || 0);

  return (
    <Pressable
      onPress={onPress}
      className="overflow-hidden rounded-[28px] bg-marca-oscura px-5 py-6">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="font-roboto text-[10px] tracking-[2px] text-crema/70">
            INGRESOS DEL MES
          </Text>
          <Text className="mt-2 font-serif-light text-[34px] leading-[38px] text-crema">
            {formatCOP(stats.totalRevenue)}
          </Text>
          <Text className="mt-3 font-roboto text-[12px] text-crema/70">Resumen de actividad →</Text>
        </View>
        <Sparkline valores={curva} />
      </View>
    </Pressable>
  );
}
