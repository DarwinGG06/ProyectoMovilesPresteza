import { type ComponentProps } from 'react';
import { type Href, router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { IconoNav } from '@/shared/components/nav-bar/IconoNav';

import { hrefAdmin } from '../../rutas';
import type { PedidoAdmin, PestanaAdmin, StatsAdmin } from '../../types';
import { HeroAdmin } from '../HeroAdmin';
import { MenuAdmin } from '../PestanasAdmin';

type NombreIcono = ComponentProps<typeof IconoNav>['name'];

type TabDashboardProps = {
  stats: StatsAdmin;
  pedidos: PedidoAdmin[];
};

function irA(tab: PestanaAdmin) {
  router.replace(hrefAdmin(tab));
}

function AvisoPendiente({ texto, onPress }: { texto: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="mt-2 flex-row items-center rounded-[22px] bg-white px-4 py-4"
      style={{
        shadowColor: '#3a0c20',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
      }}>
      <IconoNav name="notifications-outline" size={18} className="text-marca" />
      <Text className="ml-3 flex-1 font-roboto text-[14px] text-tinta">{texto}</Text>
      <IconoNav name="chevron-forward" size={16} className="text-tinta/25" />
    </Pressable>
  );
}

function TarjetaDato({
  etiqueta,
  valor,
  icono,
  onPress,
}: {
  etiqueta: string;
  valor: number;
  icono: NombreIcono;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="mb-3 w-[48%] rounded-[22px] bg-white px-4 py-4"
      style={{
        shadowColor: '#3a0c20',
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
      }}>
      <View className="flex-row items-center justify-between">
        <IconoNav name={icono} size={18} className="text-marca" />
        <IconoNav name="chevron-forward" size={14} className="text-tinta/25" />
      </View>
      <Text className="mt-5 font-roboto text-[13px] text-tinta/45">{etiqueta}</Text>
      <Text className="mt-1 font-serif-light text-[32px] leading-[36px] text-tinta">{valor}</Text>
    </Pressable>
  );
}

export function TabDashboard({ stats, pedidos }: TabDashboardProps) {
  return (
    <View>
      <View className="mb-1 flex-row items-start justify-between">
        <View>
          <MenuAdmin
            activa="dashboard"
            onChange={irA}
            contadores={{
              pedidos: stats.pendingOrders,
              reservas: stats.pendingReservations,
              mensajes: stats.unreadMessages,
            }}
          />
          <Text className="mt-1 font-serif-light text-[34px] leading-[38px] text-tinta">
            Admin Presteza
          </Text>
        </View>
        <Pressable
          onPress={() => irA('ajustes')}
          hitSlop={10}
          className="mt-1 h-9 w-9 items-center justify-center">
          <IconoNav name="settings-outline" size={20} className="text-tinta/35" />
        </Pressable>
      </View>

      <View className="mt-6">
        <HeroAdmin stats={stats} pedidos={pedidos} onPress={() => irA('pedidos')} />
      </View>

      <View className="mb-3 mt-8 flex-row items-center">
        <Text className="font-roboto text-[10px] tracking-[2px] text-tinta/35">RESUMEN GENERAL</Text>
        <View className="ml-3 h-px flex-1 bg-tinta/10" />
      </View>

      <View className="flex-row flex-wrap justify-between">
        <TarjetaDato
          etiqueta="Pedidos"
          valor={stats.totalOrders}
          icono="bag-handle-outline"
          onPress={() => irA('pedidos')}
        />
        <TarjetaDato
          etiqueta="Reservas"
          valor={stats.pendingReservations}
          icono="calendar-outline"
          onPress={() => router.replace('/home/admin/reservas?filtro=pending' as Href)}
        />
        <TarjetaDato
          etiqueta="Categorías"
          valor={stats.totalCategorias}
          icono="grid-outline"
          onPress={() => irA('categorias')}
        />
        <TarjetaDato
          etiqueta="Inventario"
          valor={stats.totalInsumos}
          icono="file-tray-outline"
          onPress={() => irA('inventario')}
        />
        <TarjetaDato
          etiqueta="Adicionales"
          valor={stats.totalAdicionales}
          icono="add-circle-outline"
          onPress={() => irA('adicionales')}
        />
        <TarjetaDato
          etiqueta="Clientes"
          valor={stats.totalCustomers}
          icono="person-outline"
          onPress={() => irA('clientes')}
        />
      </View>

      {stats.pendingOrders > 0 ? (
        <AvisoPendiente
          texto={
            stats.pendingOrders === 1
              ? '1 pedido por revisar'
              : `${stats.pendingOrders} pedidos por revisar`
          }
          onPress={() => router.replace('/home/admin/pedidos?filtro=pending' as Href)}
        />
      ) : null}
      {stats.pendingReservations > 0 ? (
        <AvisoPendiente
          texto={
            stats.pendingReservations === 1
              ? '1 reserva pendiente'
              : `${stats.pendingReservations} reservas pendientes`
          }
          onPress={() => router.replace('/home/admin/reservas?filtro=pending' as Href)}
        />
      ) : null}
    </View>
  );
}
