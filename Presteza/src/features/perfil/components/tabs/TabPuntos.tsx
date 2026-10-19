import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { formatCOP } from '@/services/cart/CartContext';

import { usePuntos } from '../../hooks/usePuntos';
import { formatFecha } from '../../utils';
import { CuentaEscrita } from '../CuentaEscrita';
import { EstadoVacio, Mensaje, TarjetaPerfil } from '../TarjetaPerfil';

type TabPuntosProps = {
  userId: string;
};

export function TabPuntos({ userId }: TabPuntosProps) {
  const { programa, historial, cargando, error, recargar } = usePuntos(userId);

  if (cargando && !programa) {
    return (
      <View className="items-center py-10">
        <ActivityIndicator color="#d4af77" />
        <Text className="mt-3 font-roboto text-sm text-crema/70">Cargando tus puntos...</Text>
      </View>
    );
  }

  if (!programa) {
    return (
      <TarjetaPerfil numero="I" badge="PUNTOS" titulo="Fidelidad">
        <Mensaje texto={error || 'No se pudo cargar el programa.'} error />
        <Pressable onPress={() => void recargar()} className="self-start">
          <Text className="font-roboto text-[11px] tracking-[2px] text-oro">REINTENTAR →</Text>
        </Pressable>
      </TarjetaPerfil>
    );
  }

  const valorSaldo = programa.points * programa.rules.pointValueCop;
  const siguiente = programa.nextTier;

  return (
    <View>
      {error ? <Mensaje texto={error} error /> : null}

      <TarjetaPerfil numero="I" badge="SALDO" titulo={programa.tier.name}>
        <Text className="font-roboto-light text-[42px] leading-[46px] text-oro">
          {programa.points}
        </Text>
        <Text className="mt-1 font-roboto text-sm text-crema/60">
          {formatCOP(valorSaldo)} para canjear en caja
        </Text>

        <View className="mt-6">
          <CuentaEscrita
            animar={false}
            filas={[
              { etiqueta: 'NIVEL', valor: programa.tier.name },
              { etiqueta: 'GANADOS', valor: String(programa.pointsEarned) },
              { etiqueta: 'CANJEADOS', valor: String(programa.pointsRedeemed) },
              { etiqueta: 'PEDIDOS', valor: String(programa.completedOrders) },
            ]}
          />
        </View>

        {siguiente ? (
          <Text className="mt-5 font-roboto text-sm leading-5 text-crema/70">
            Te faltan {siguiente.pointsNeeded} puntos o {siguiente.ordersNeeded} pedidos para{' '}
            {siguiente.name}.
          </Text>
        ) : (
          <Text className="mt-5 font-roboto text-sm text-crema/70">
            Estás en el nivel más alto de la casa.
          </Text>
        )}
      </TarjetaPerfil>

      <TarjetaPerfil numero="II" badge="MESA" titulo="Beneficios">
        {programa.tier.benefits.map((beneficio) => (
          <View key={beneficio} className="flex-row items-start border-b border-oro/20 py-3.5">
            <Text className="mr-3 font-roboto text-[10px] text-oro">●</Text>
            <Text className="flex-1 font-roboto text-sm leading-5 text-crema">{beneficio}</Text>
          </View>
        ))}
        <Text className="mt-5 font-roboto text-[11px] leading-5 text-crema/45">
          1 punto por cada {formatCOP(programa.rules.pointCopUnit)} pagados. Canje mínimo:{' '}
          {programa.rules.minRedeemPoints} puntos. Máximo {programa.rules.maxRedeemPercent}% del
          pedido.
        </Text>
      </TarjetaPerfil>

      <TarjetaPerfil numero="III" badge="CUENTA" titulo="Movimientos">
        {historial.length === 0 ? (
          <EstadoVacio
            icono="star-outline"
            titulo="Aún no hay movimientos"
            texto="Los puntos se acreditan cuando un pedido queda entregado."
          />
        ) : (
          historial.map((item, index) => (
            <View key={item.id || `${item.createdAt}-${index}`} className="border-b border-oro/20 py-4">
              <View className="flex-row items-baseline">
                <Text className="w-7 font-roboto text-[10px] text-oro">
                  {String(index + 1).padStart(2, '0')}
                </Text>
                <Text className="font-roboto-light text-lg text-crema">{item.etiqueta}</Text>
                <View className="mx-2 mb-1 h-px flex-1 bg-oro/35" />
                <Text className="font-roboto text-oro">
                  {item.signo}
                  {item.points}
                </Text>
              </View>
              <Text className="ml-7 mt-1 font-roboto text-xs text-crema/50">
                {formatFecha(item.createdAt)}
                {item.discountCop > 0 ? ` · ${formatCOP(item.discountCop)}` : ''}
              </Text>
              {item.description ? (
                <Text className="ml-7 mt-1 font-roboto text-xs leading-4 text-crema/40">
                  {item.description}
                </Text>
              ) : null}
            </View>
          ))
        )}
      </TarjetaPerfil>
    </View>
  );
}
