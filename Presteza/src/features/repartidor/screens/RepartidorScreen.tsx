import { ActivityIndicator, Pressable, ScrollView, Switch, Text, View } from 'react-native';

import Button from '@/components/Button';
import { idDe } from '@/api/helpers';
import { formatCOP } from '@/services/cart/CartContext';
import { formatoFechaHora, textoEntrega, textoEstadoPedido } from '@/features/administracion/utils';
import { MapaRuta } from '@/shared/components/mapa/MapaRuta';
import { Pergamino } from '@/shared/components/materiales/Pergamino';
import { SelloP } from '@/shared/components/nav-bar/SelloP';

import { useRepartidor } from '../hooks/useRepartidor';
import { useUbicacionRepartidor } from '../hooks/useUbicacionRepartidor';

function claveEstado(status?: string) {
  return String(status || '').trim().toLowerCase();
}

export function RepartidorScreen() {
  const tab = useRepartidor();
  const idsEnCamino = tab.pedidos
    .filter((pedido) => claveEstado(pedido.status) === 'en_camino')
    .map((pedido) => idDe(pedido))
    .filter((id): id is string => Boolean(id));
  const ubicacion = useUbicacionRepartidor(idsEnCamino);
  const enRuta = idsEnCamino.length > 0;

  if (!tab.autorizado) {
    return (
      <View className="flex-1 items-center justify-center bg-pergamino">
        <ActivityIndicator color="#6b1d3d" />
      </View>
    );
  }

  return (
    <Pergamino fill>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}>
        <View className="bg-crema">
          <View className="flex-row items-center justify-between px-5 pb-3 pt-8">
            <View>
              <Text className="font-roboto text-[10px] tracking-[3px] text-marca">REPARTO</Text>
              <Text className="mt-1 font-serif-light text-[28px] leading-8 text-tinta">
                {ubicacion.conectado ? 'Estás conectado' : 'Estás desconectado'}
              </Text>
            </View>
            <Switch
              value={ubicacion.conectado}
              onValueChange={ubicacion.cambiar}
              trackColor={{ false: '#ebe3d4', true: '#6b1d3d' }}
              thumbColor={ubicacion.conectado ? '#d4af77' : '#faf6f2'}
              accessibilityLabel="Compartir ubicación"
            />
          </View>

          <MapaRuta alto={340} repartidor={ubicacion.punto} />

          <View className="mx-4 -mt-5 mb-2 border border-linea bg-white px-4 py-3">
            <Text className="text-center font-roboto text-sm text-tinta">
              {ubicacion.conectado
                ? enRuta
                  ? 'El cliente ve este mapa mientras vas en camino.'
                  : 'Conectado. Al salir a entregar, el cliente verá el punto.'
                : 'Activa el interruptor para compartir la ruta.'}
            </Text>
            {ubicacion.aviso ? (
              <Text className="mt-2 text-center font-roboto text-xs text-marca">{ubicacion.aviso}</Text>
            ) : null}
          </View>
        </View>

        <View className="px-6 pb-4 pt-6">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="font-roboto text-[10px] tracking-[4px] text-marca">REPARTO</Text>
              <Text className="mt-2 font-serif-light text-[34px] leading-[38px] text-tinta">
                Mis pedidos
              </Text>
            </View>
            <SelloP size="sm" />
          </View>
          <Text className="mt-3 font-roboto text-sm text-tinta/60">Hola, {tab.nombre}</Text>
          <View className="mt-4 h-px w-10 bg-marca/35" />

          <View className="mt-5 flex-row gap-3">
            <Pressable
              onPress={() => void tab.recargar()}
              className="border border-oro px-4 py-3 active:opacity-80">
              <Text className="font-roboto text-[10px] tracking-[2px] text-marca-oscura">
                ACTUALIZAR
              </Text>
            </Pressable>
            <Pressable
              onPress={tab.cerrarSesion}
              className="border border-madera/30 px-4 py-3 active:opacity-80">
              <Text className="font-roboto text-[10px] tracking-[2px] text-tinta/70">
                CERRAR SESIÓN
              </Text>
            </Pressable>
          </View>
        </View>

        {tab.cargando ? (
          <View className="items-center py-16">
            <ActivityIndicator color="#6b1d3d" />
            <Text className="mt-3 font-roboto text-sm text-tinta/60">Buscando domicilios...</Text>
          </View>
        ) : null}

        {tab.error ? (
          <Text className="mx-6 mt-4 font-roboto text-sm text-red-700">{tab.error}</Text>
        ) : null}

        {!tab.cargando && !tab.pedidos.length ? (
          <View className="mx-6 mt-10 border border-dashed border-madera/30 px-5 py-10">
            <Text className="font-serif-light text-2xl text-tinta">Sin pedidos</Text>
            <Text className="mt-2 font-roboto text-sm leading-6 text-tinta/60">
              Cuando un domicilio quede en estado Listo, aparecerá aquí para salir a entregar.
            </Text>
          </View>
        ) : null}

        <View className="mt-4 gap-4 px-6">
          {tab.pedidos.map((pedido) => {
            const id = idDe(pedido);
            const estado = claveEstado(pedido.status);
            const ocupado = tab.ocupadoId === id;
            const listo = estado === 'listo';
            const enCamino = estado === 'en_camino';

            return (
              <View key={id || pedido.createdAt} className="border border-linea bg-white px-4 py-4">
                <Text className="font-roboto text-[10px] tracking-[2px] text-marca">
                  {textoEstadoPedido(pedido.status).toUpperCase()}
                </Text>
                <Text className="mt-2 font-serif-light text-2xl text-tinta">
                  {pedido.user_name || 'Cliente'}
                </Text>
                <Text className="mt-1 font-roboto text-sm text-tinta/65">
                  {textoEntrega(pedido) || 'Domicilio'}
                </Text>
                <Text className="mt-1 font-roboto text-xs text-tinta/45">
                  {formatoFechaHora(pedido.createdAt)}
                </Text>

                <View className="mt-4 border-t border-madera/15 pt-3">
                  {(pedido.products ?? []).slice(0, 4).map((item, index) => (
                    <Text
                      key={`${item.dishId}-${index}`}
                      className="py-0.5 font-roboto text-sm text-tinta/80">
                      {item.quantity} × {item.name}
                    </Text>
                  ))}
                  <View className="mt-3 flex-row items-end justify-between">
                    <Text className="font-roboto text-[10px] tracking-[2px] text-marca">TOTAL</Text>
                    <Text className="font-serif-light text-2xl text-tinta">
                      {formatCOP(pedido.total || 0)}
                    </Text>
                  </View>
                </View>

                <View className="mt-4 gap-2">
                  {listo ? (
                    <Button
                      variant="gold"
                      text={ocupado ? 'SALIENDO…' : 'SALIR A ENTREGAR'}
                      disabled={ocupado}
                      onPress={() => {
                        ubicacion.conectar();
                        void tab.salirAEntregar(pedido);
                      }}
                    />
                  ) : null}
                  {enCamino ? (
                    <Button
                      variant="primary"
                      text={ocupado ? 'MARCANDO…' : 'ENTREGADO'}
                      disabled={ocupado}
                      onPress={() => void tab.entregar(pedido)}
                    />
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </Pergamino>
  );
}
