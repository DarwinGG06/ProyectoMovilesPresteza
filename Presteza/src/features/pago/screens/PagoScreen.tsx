import { Pressable, Text, View } from 'react-native';

import Badge from '@/components/Badge';
import Button from '@/components/Button';
import Tarjeta from '@/components/Tarjeta';
import { ContenedorPantalla } from '@/shared/components/contenedor-pantalla/ContenedorPantalla';
import { LoginModal } from '@/shared/components/nav-bar/LoginModal';
import { formatCOP } from '@/services/cart/CartContext';

import { usePago } from '../hooks/usePago';

export function PagoScreen() {
  const pago = usePago();
  const cotizacion = pago.cotizacion;
  const totalAPagar = cotizacion?.total ?? pago.totalPrice;

  return (
    <>
      <ContenedorPantalla titulo="Pago">
        <Badge text="EN MESA" className="mt-4" />
        <Text className="mt-3 font-roboto text-base leading-6 text-texto/70">
          Confirmas el pedido aquí. Se paga en el restaurante y los puntos se acreditan cuando
          quede entregado.
        </Text>

        {pago.items.length === 0 ? (
          <Tarjeta className="mt-8 gap-3">
            <Badge text="BANDEJA" variant="sello" />
            <Text className="font-serif-light text-2xl text-marca-oscura">Aún no hay platos</Text>
            <Pressable onPress={pago.irAlMenu} className="mt-2 self-start">
              <Text className="font-roboto text-[11px] tracking-[2px] text-marca">IR AL MENÚ →</Text>
            </Pressable>
          </Tarjeta>
        ) : (
          <>
            <Tarjeta className="mt-8 gap-1">
              <Badge text="PEDIDO" variant="sello" />
              {pago.items.map((item) => (
                <View key={item.id} className="flex-row items-baseline py-2.5">
                  <Text className="font-roboto text-sm text-marca-oscura">
                    {item.quantity} × {item.productName}
                  </Text>
                  <View className="mx-2 mb-1 h-px flex-1 bg-oro/35" />
                  <Text className="font-roboto text-marca">{formatCOP(item.totalPrice)}</Text>
                </View>
              ))}
            </Tarjeta>

            <Tarjeta className="mt-4 gap-3">
              <Badge text="PUNTOS" variant="sello" />
              {!pago.isAuthenticated ? (
                <Text className="font-roboto text-sm leading-5 text-texto/70">
                  Entra a tu cuenta para ver el saldo y canjear.
                </Text>
              ) : (
                <>
                  <View className="flex-row items-baseline">
                    <Text className="font-roboto text-sm text-texto/70">Subtotal</Text>
                    <View className="mx-2 mb-1 h-px flex-1 bg-oro/35" />
                    <Text className="font-roboto text-marca-oscura">
                      {formatCOP(cotizacion?.subtotal ?? pago.totalPrice)}
                    </Text>
                  </View>
                  {(cotizacion?.tierDiscount ?? 0) > 0 ? (
                    <View className="flex-row items-baseline">
                      <Text className="font-roboto text-sm text-texto/70">
                        Nivel {cotizacion?.tier.name}
                      </Text>
                      <View className="mx-2 mb-1 h-px flex-1 bg-oro/35" />
                      <Text className="font-roboto text-marca-oscura">
                        −{formatCOP(cotizacion?.tierDiscount ?? 0)}
                      </Text>
                    </View>
                  ) : null}
                  {(cotizacion?.birthdayDiscount ?? 0) > 0 ? (
                    <View className="flex-row items-baseline">
                      <Text className="font-roboto text-sm text-texto/70">Cumpleaños</Text>
                      <View className="mx-2 mb-1 h-px flex-1 bg-oro/35" />
                      <Text className="font-roboto text-marca-oscura">
                        −{formatCOP(cotizacion?.birthdayDiscount ?? 0)}
                      </Text>
                    </View>
                  ) : null}
                  {(cotizacion?.pointsDiscount ?? 0) > 0 ? (
                    <View className="flex-row items-baseline">
                      <Text className="font-roboto text-sm text-texto/70">
                        Canje {cotizacion?.pointsRedeemed} pts
                      </Text>
                      <View className="mx-2 mb-1 h-px flex-1 bg-oro/35" />
                      <Text className="font-roboto text-marca-oscura">
                        −{formatCOP(cotizacion?.pointsDiscount ?? 0)}
                      </Text>
                    </View>
                  ) : null}

                  {pago.cumpleDisponible ? (
                    <Text className="font-roboto text-xs leading-5 text-texto/55">
                      Hoy solo puedes elegir uno: 15% de cumpleaños o canje de puntos.
                    </Text>
                  ) : null}

                  {pago.cumpleDisponible ? (
                    <Pressable
                      onPress={() => pago.setCanjear(false)}
                      disabled={pago.cotizando || pago.enviando}
                      className={`mt-1 border px-4 py-3 ${!pago.canjear ? 'border-oro bg-oro/15' : 'border-oro/40'}`}>
                      <Text className="text-center font-roboto text-[11px] tracking-[2px] text-marca-oscura">
                        15% CUMPLEAÑOS
                      </Text>
                    </Pressable>
                  ) : null}

                  {pago.puedeCanjear ? (
                    <Pressable
                      onPress={() => pago.setCanjear(true)}
                      disabled={pago.cotizando || pago.enviando}
                      className={`mt-1 border px-4 py-3 ${pago.canjear ? 'border-oro bg-oro/15' : 'border-oro/40'}`}>
                      <Text className="text-center font-roboto text-[11px] tracking-[2px] text-marca-oscura">
                        {pago.canjear
                          ? `CANJEAR ${cotizacion?.pointsRedeemed ?? 0} PUNTOS`
                          : `USAR PUNTOS (máx. ${cotizacion?.maxRedeemable ?? 0})`}
                      </Text>
                    </Pressable>
                  ) : !pago.cumpleDisponible ? (
                    <Text className="font-roboto text-xs leading-5 text-texto/55">
                      El canje mínimo es 50 puntos y no puede superar la mitad del pedido.
                    </Text>
                  ) : null}

                  {cotizacion?.estimatedPoints ? (
                    <Text className="font-roboto text-xs text-texto/55">
                      Este pedido sumará unos {cotizacion.estimatedPoints} puntos al entregarse.
                    </Text>
                  ) : null}
                </>
              )}
            </Tarjeta>

            <Tarjeta className="mt-4 gap-3">
              <Badge text="MEDIOS" variant="sello" />
              <View className="flex-row flex-wrap gap-2">
                {pago.metodos.map((opcion) => {
                  const activo = pago.metodo === opcion.value;
                  return (
                    <Pressable
                      key={opcion.value}
                      onPress={() => pago.setMetodo(opcion.value)}
                      className={`border px-4 py-2 ${activo ? 'border-oro bg-oro/15' : 'border-oro/35'}`}>
                      <Text className="font-roboto text-[11px] tracking-[1px] text-marca-oscura">
                        {opcion.label.toUpperCase()}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Tarjeta>

            <View className="mt-8 flex-row items-end justify-between">
              <Text className="font-roboto text-[11px] tracking-[2px] text-marca">A PAGAR</Text>
              <Text className="font-serif-light text-3xl text-marca-oscura">
                {formatCOP(totalAPagar)}
              </Text>
            </View>

            {pago.error ? (
              <Text className="mt-4 font-roboto text-sm text-red-700">{pago.error}</Text>
            ) : null}
            {pago.exito ? (
              <Text className="mt-4 font-roboto text-sm text-marca-oscura">{pago.exito}</Text>
            ) : null}

            <Button
              className="mt-5"
              variant="gold"
              disabled={pago.enviando || pago.cotizando}
              onPress={() => void pago.confirmar()}
              text={
                !pago.isAuthenticated
                  ? 'ENTRAR Y CONFIRMAR'
                  : pago.enviando
                    ? 'ENVIANDO...'
                    : 'CONFIRMAR PEDIDO'
              }
            />
          </>
        )}
      </ContenedorPantalla>
      <LoginModal visible={pago.loginAbierto} onClose={pago.cerrarLogin} />
    </>
  );
}
