import { Text, View } from 'react-native';

import { BarraEstadosPedido } from '@/components/BarraEstadosPedido';
import { formatCOP } from '@/services/cart/CartContext';

import { idPedido } from '@/api/perfil';
import { usePedidosPerfil } from '../../hooks/usePedidosPerfil';
import type { Pedido } from '../../types';
import { formatFecha, metodoPagoNombre, textoEntrega, textoEstadoPedido, totalItemsPedido } from '../../utils';
import { EnlaceAccion, LineaCuenta } from '../elementos';
import { EstadoVacio, TarjetaPerfil } from '../TarjetaPerfil';

type TabPedidosProps = {
  pedidos: Pedido[];
};

export function TabPedidos({ pedidos }: TabPedidosProps) {
  const { lista, estaAbierto, alternarDetalle, repetir, irAlMenu, irASeguimiento } =
    usePedidosPerfil(pedidos);

  return (
    <TarjetaPerfil numero="I" badge="PEDIDOS" titulo="Historial" compacto>
      {lista.length === 0 ? (
        <EstadoVacio
          icono="receipt-outline"
          titulo="No tienes pedidos"
          texto="Cuando pidas, el seguimiento aparece aquí."
          accion={{ etiqueta: 'Ver menú', onPress: irAlMenu }}
        />
      ) : (
        <View>
          {lista.map((pedido, index) => {
            const id = idPedido(pedido);
            const abierto = estaAbierto(id);

            return (
              <LineaCuenta
                key={id}
                indice={index}
                titulo={`#${id.slice(-8).toUpperCase()}`}
                sello={textoEstadoPedido(pedido.status).toUpperCase()}>
                <Text className="mt-1 font-roboto text-sm text-tinta/70">
                  {formatFecha(pedido.createdAt)}
                </Text>
                <View className="mt-2 flex-row items-baseline">
                  <Text className="font-roboto text-sm text-tinta/70">
                    {totalItemsPedido(pedido)}{' '}
                    {totalItemsPedido(pedido) === 1 ? 'producto' : 'productos'}
                  </Text>
                  <View className="mx-2 mb-1 h-px flex-1 bg-madera/25" />
                  <Text className="font-roboto text-lg text-marca">{formatCOP(pedido.total)}</Text>
                </View>

                <BarraEstadosPedido status={pedido.status} />

                <View className="mt-3 flex-row">
                  <EnlaceAccion
                    etiqueta={abierto ? 'OCULTAR' : 'DETALLE'}
                    onPress={() => alternarDetalle(id)}
                  />
                  <EnlaceAccion etiqueta="SEGUIR" onPress={() => irASeguimiento(id)} />
                  <EnlaceAccion etiqueta="REPETIR" onPress={() => repetir(pedido)} />
                </View>

                {abierto ? (
                  <View className="mt-3">
                    {pedido.products?.map((item, itemIndex) => (
                      <View
                        key={`${item.dishId}-${itemIndex}`}
                        className="flex-row items-baseline py-1.5">
                        <Text className="flex-1 font-roboto text-sm text-tinta/70">
                          {item.name} × {item.quantity}
                        </Text>
                        <Text className="font-roboto text-sm text-marca">
                          {formatCOP(item.unit_price * item.quantity)}
                        </Text>
                      </View>
                    ))}
                    {textoEntrega(pedido) ? (
                      <Text className="mt-2 font-roboto text-xs text-tinta/70">
                        {textoEntrega(pedido)}
                      </Text>
                    ) : null}
                    <Text className="mt-2 font-roboto text-xs text-tinta/70">
                      Pago: {metodoPagoNombre(pedido.payment_method)}
                    </Text>
                  </View>
                ) : null}
              </LineaCuenta>
            );
          })}
        </View>
      )}
    </TarjetaPerfil>
  );
}
