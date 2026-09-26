import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { formatCOP } from '@/services/cart/CartContext';

import { hrefAdmin } from '../../rutas';
import type { PedidoAdmin, PestanaAdmin, StatsAdmin } from '../../types';
import { formatoFechaHora, idDe, textoEstadoPedido } from '../../utils';

type TabDashboardProps = {
  stats: StatsAdmin;
  pedidos: PedidoAdmin[];
};

function irA(tab: PestanaAdmin) {
  router.push(hrefAdmin(tab));
}

function Mosaic({
  etiqueta,
  valor,
  onPress,
  ancho = 'mitad',
}: {
  etiqueta: string;
  valor: string;
  onPress: () => void;
  ancho?: 'mitad' | 'completo';
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`mb-3 border border-oro/20 bg-marca/35 px-4 py-5 ${ancho === 'completo' ? 'w-full' : 'w-[48%]'}`}>
      <Text className="text-[10px] tracking-[2px] text-oro">{etiqueta}</Text>
      <Text className="mt-2 text-[32px] font-light leading-[36px] text-white">{valor}</Text>
    </Pressable>
  );
}

export function TabDashboard({ stats, pedidos }: TabDashboardProps) {
  const recientes = [...pedidos]
    .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
    .slice(0, 4);

  return (
    <View>
      <Text className="mb-4 text-[10px] tracking-[3px] text-oro">RESUMEN</Text>

      <View className="flex-row flex-wrap justify-between">
        <Mosaic etiqueta="INGRESOS" valor={formatCOP(stats.totalRevenue)} onPress={() => irA('pedidos')} ancho="completo" />
        <Mosaic etiqueta="PEDIDOS" valor={String(stats.totalOrders)} onPress={() => irA('pedidos')} />
        <Mosaic etiqueta="PENDIENTES" valor={String(stats.pendingOrders)} onPress={() => irA('pedidos')} />
        <Mosaic etiqueta="CATEGORÍAS" valor={String(stats.totalCategorias)} onPress={() => irA('categorias')} />
        <Mosaic etiqueta="INVENTARIO" valor={String(stats.totalInsumos)} onPress={() => irA('inventario')} />
        <Mosaic etiqueta="ADICIONALES" valor={String(stats.totalAdicionales)} onPress={() => irA('adicionales')} />
        <Mosaic etiqueta="CLIENTES" valor={String(stats.totalCustomers)} onPress={() => irA('clientes')} />
        <Mosaic etiqueta="PRODUCTOS" valor={String(stats.totalProducts)} onPress={() => irA('productos')} />
      </View>

      <Pressable onPress={() => irA('pedidos')} className="mb-10 mt-2 border-y border-oro/25 py-5">
        <View className="flex-row items-end justify-between">
          <Text className="text-[11px] tracking-[2px] text-crema">ÚLTIMOS PEDIDOS</Text>
          <Text className="text-[11px] tracking-[2px] text-oro">VER PEDIDOS →</Text>
        </View>

        {recientes.length === 0 ? (
          <Text className="mt-4 text-sm text-crema/55">Todavía no hay pedidos.</Text>
        ) : (
          recientes.map((pedido) => (
            <View key={idDe(pedido)} className="mt-4 flex-row items-baseline">
              <Text className="w-16 text-[11px] text-oro">#{idDe(pedido).slice(-4).toUpperCase()}</Text>
              <Text className="flex-1 text-sm text-white" numberOfLines={1}>
                {pedido.user_name || 'Cliente'}
              </Text>
              <Text className="ml-2 text-[10px] tracking-[1px] text-crema/50">
                {textoEstadoPedido(pedido.status).toUpperCase()}
              </Text>
              <Text className="ml-3 text-sm text-oro">{formatCOP(pedido.total || 0)}</Text>
            </View>
          ))
        )}
        {recientes[0] ? (
          <Text className="mt-4 text-[11px] text-crema/40">{formatoFechaHora(recientes[0].createdAt)}</Text>
        ) : null}
      </Pressable>
    </View>
  );
}
