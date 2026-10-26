import { Pressable, ScrollView, Text, View } from 'react-native';

import { BarraEstadosPedido } from '@/components/BarraEstadosPedido';
import Button from '@/components/Button';
import { idPedido } from '@/api/perfil';
import { formatCOP } from '@/services/cart/CartContext';
import { EvitarTeclado } from '@/shared/components/evitar-teclado/EvitarTeclado';
import { Pergamino } from '@/shared/components/materiales/Pergamino';
import { SelloP } from '@/shared/components/nav-bar/SelloP';

import { formatFecha, textoEntrega, textoEstadoPedido } from '../utils';
import { useSeguimiento } from '../hooks/useSeguimiento';

export function SeguimientoScreen() {
  const seguimiento = useSeguimiento();

  if (!seguimiento.isAuthenticated) {
    return (
      <View className="flex-1 items-center justify-center bg-pergamino px-6">
        <Text className="text-center font-serif-light text-2xl text-tinta">
          Entra a tu cuenta para ver el pedido.
        </Text>
        <Pressable onPress={seguimiento.irAlPerfil} className="mt-6">
          <Text className="font-roboto text-[11px] tracking-[2px] text-marca">IR AL PERFIL</Text>
        </Pressable>
      </View>
    );
  }

  if (seguimiento.cargando) {
    return (
      <View className="flex-1 items-center justify-center bg-pergamino">
        <SelloP size="md" />
        <Text className="mt-4 font-roboto text-sm text-tinta/70">Buscando tu pedido...</Text>
      </View>
    );
  }

  const pedido = seguimiento.pedido;

  return (
    <EvitarTeclado>
      <Pergamino fill>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="px-6 pb-16 pt-10">
            <Text className="font-roboto text-[10px] tracking-[4px] text-marca">EN COCINA</Text>
            <Text className="mt-2 font-serif-light text-[36px] leading-[40px] text-tinta">
              Seguimiento
            </Text>
            <View className="mt-4 h-px w-10 bg-marca/35" />

            {seguimiento.error ? (
              <Text className="mt-6 font-roboto text-sm text-red-700">{seguimiento.error}</Text>
            ) : null}

            {!pedido ? (
              <View className="mt-8">
                <Text className="font-roboto text-base leading-6 text-tinta/70">
                  Todavía no hay un pedido para seguir.
                </Text>
                <Button className="mt-6" variant="gold" text="VER LA CARTA" onPress={seguimiento.irAlMenu} />
              </View>
            ) : (
              <View className="mt-8">
                <Text className="font-roboto text-[10px] tracking-[2px] text-marca">
                  #{idPedido(pedido).slice(-8).toUpperCase()}
                </Text>
                <Text className="mt-2 font-serif-light text-2xl text-tinta">
                  {textoEstadoPedido(pedido.status)}
                </Text>
                <Text className="mt-1 font-roboto text-sm text-tinta/70">
                  {formatFecha(pedido.createdAt)}
                </Text>
                {textoEntrega(pedido) ? (
                  <Text className="mt-2 font-roboto text-sm text-tinta/70">
                    {textoEntrega(pedido)}
                  </Text>
                ) : null}

                <View className="mt-8">
                  <BarraEstadosPedido status={pedido.status} amplia />
                </View>

                <View className="mt-8 border-t border-madera/20 pt-5">
                  {(pedido.products ?? []).map((item, index) => (
                    <View key={`${item.dishId}-${index}`} className="flex-row items-baseline py-2">
                      <Text className="flex-1 font-roboto text-base text-tinta">
                        {item.quantity} × {item.name}
                      </Text>
                      <Text className="font-roboto text-marca">
                        {formatCOP(item.unit_price * item.quantity)}
                      </Text>
                    </View>
                  ))}
                  <View className="mt-4 flex-row items-end justify-between">
                    <Text className="font-roboto text-[10px] tracking-[2px] text-marca">TOTAL</Text>
                    <Text className="font-serif-light text-3xl text-tinta">
                      {formatCOP(pedido.total || 0)}
                    </Text>
                  </View>
                </View>

                <Button className="mt-8" variant="gold" text="MI CUENTA" onPress={seguimiento.irAlPerfil} />
              </View>
            )}
          </View>
        </ScrollView>
      </Pergamino>
    </EvitarTeclado>
  );
}
