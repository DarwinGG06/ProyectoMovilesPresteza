import { Text, View } from 'react-native';

import { formatCOP } from '@/services/cart/CartContext';

import { idPedido } from '@/api/perfil';
import { usePedidosPerfil } from '../../hooks/usePedidosPerfil';
import type { Pedido } from '../../types';
import {
  formatFecha,
  indiceEstadoPedido,
  metodoPagoNombre,
  textoEstadoPedido,
  totalItemsPedido,
} from '../../utils';
import { EnlaceAccion, LineaCuenta } from '../elementos';
import { EstadoVacio, TarjetaPerfil } from '../TarjetaPerfil';

const PASOS = ['Confirmado', 'Preparando', 'Listo', 'Entregado'];

type TabPedidosProps = {
  pedidos: Pedido[];
};

export function TabPedidos({ pedidos }: TabPedidosProps) {
  const { lista, estaAbierto, alternarDetalle, repetir, irAlMenu } = usePedidosPerfil(pedidos);

  return (
    <TarjetaPerfil numero="I" badge="PEDIDOS" titulo="Historial">
      {lista.length === 0 ? (
        <EstadoVacio
          icono="receipt-outline"
          titulo="No tienes pedidos"
          texto="Cuando pidas, el seguimiento aparece aquí."
          accion={{ etiqueta: 'VER MENÚ', onPress: irAlMenu }}
        />
      ) : (
        <View>
          {lista.map((pedido, index) => {
            const id = idPedido(pedido);
            const paso = indiceEstadoPedido(pedido.status);
            const abierto = estaAbierto(id);

            return (
              <LineaCuenta
                key={id}
                indice={index}
                titulo={`#${id.slice(-8).toUpperCase()}`}
                sello={textoEstadoPedido(pedido.status).toUpperCase()}>
                <Text className="mt-1 font-roboto text-sm text-crema/55">
                  {formatFecha(pedido.createdAt)}
                </Text>
                <View className="mt-2 flex-row items-baseline">
                  <Text className="font-roboto text-sm text-crema/55">
                    {totalItemsPedido(pedido)}{' '}
                    {totalItemsPedido(pedido) === 1 ? 'producto' : 'productos'}
                  </Text>
                  <View className="mx-2 mb-1 h-px flex-1 bg-oro/35" />
                  <Text className="font-roboto text-lg text-oro">{formatCOP(pedido.total)}</Text>
                </View>

                {paso >= 0 ? (
                  <View className="mt-4 flex-row justify-between">
                    {PASOS.map((nombre, pasoIndex) => (
                      <View key={nombre} className="flex-1 items-center">
                        <View
                          className={`h-1.5 w-1.5 rounded-full ${pasoIndex <= paso ? 'bg-oro' : 'bg-oro/20'}`}
                        />
                        <Text
                          className={`mt-2 text-center font-roboto text-[10px] ${
                            pasoIndex <= paso ? 'text-oro' : 'text-crema/30'
                          }`}>
                          {nombre}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : null}

                <View className="mt-3 flex-row">
                  <EnlaceAccion
                    etiqueta={abierto ? 'OCULTAR' : 'DETALLE'}
                    onPress={() => alternarDetalle(id)}
                  />
                  <EnlaceAccion etiqueta="REPETIR" onPress={() => repetir(pedido)} />
                </View>

                {abierto ? (
                  <View className="mt-3">
                    {pedido.products?.map((item, itemIndex) => (
                      <View
                        key={`${item.dishId}-${itemIndex}`}
                        className="flex-row items-baseline py-1.5">
                        <Text className="flex-1 font-roboto text-sm text-crema/80">
                          {item.name} × {item.quantity}
                        </Text>
                        <Text className="font-roboto text-sm text-oro">
                          {formatCOP(item.unit_price * item.quantity)}
                        </Text>
                      </View>
                    ))}
                    <Text className="mt-2 font-roboto text-xs text-crema/45">
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
