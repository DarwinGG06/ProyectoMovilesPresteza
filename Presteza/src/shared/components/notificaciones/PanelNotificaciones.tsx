import { Href, router } from 'expo-router';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Notificacion } from '@/api/notificaciones';
import { IconoNav } from '@/shared/components/nav-bar/IconoNav';
import { SelloP } from '@/shared/components/nav-bar/SelloP';
import { Pergamino } from '@/shared/components/materiales/Pergamino';
import { useNotificaciones } from '@/shared/notificaciones/NotificacionesProvider';
import { colores } from '@/theme/tokens';

import { formatoHoraAviso, iconoDeKind, selloDeKind } from './estiloNotificacion';

export function PanelNotificaciones() {
  const tab = useNotificaciones();
  const insets = useSafeAreaInsets();

  const abrir = async (item: Notificacion) => {
    if (!item.readAt) await tab.leer(item.id);
    tab.cerrar();
    if (item.href) router.push(item.href as Href);
  };

  return (
    <Modal
      visible={tab.abierta}
      transparent
      animationType="fade"
      onRequestClose={tab.cerrar}>
      <Pressable
        onPress={tab.cerrar}
        className="flex-1 justify-end bg-marca-oscura/80"
        style={{ paddingTop: insets.top + 12 }}>
        <Pressable onPress={() => {}} className="max-h-[84%] overflow-hidden">
          <Pergamino>
            <View className="bg-marca-oscura px-6 pb-5 pt-6">
              <View className="mb-4 h-1 w-14 self-center bg-oro/70" />
              <View className="flex-row items-start justify-between">
                <View className="flex-row items-center gap-3">
                  <SelloP size="sm" />
                  <View>
                    <Text className="font-roboto text-[10px] tracking-[3px] text-oro">
                      CASA PRESTEZA
                    </Text>
                    <Text className="mt-1 font-serif-light text-[30px] leading-9 text-crema">
                      Avisos
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={tab.cerrar}
                  accessibilityRole="button"
                  accessibilityLabel="Cerrar avisos"
                  className="min-h-11 min-w-11 items-center justify-center border border-oro">
                  <IconoNav name="close" size={18} color={colores.oro} />
                </Pressable>
              </View>
              <Text className="mt-3 max-w-[92%] font-roboto text-sm leading-5 text-crema/70">
                Pedidos, reservas y reparto. Toca uno para seguirlo.
              </Text>
            </View>

            <View className="flex-row items-center justify-between border-b border-madera/15 px-6 py-3.5">
              <Text className="font-roboto text-[10px] tracking-[2px] text-marca">
                {tab.unread > 0 ? `${tab.unread} SIN LEER` : 'TODO AL DÍA'}
              </Text>
              {tab.unread > 0 ? (
                <Pressable onPress={() => void tab.leerTodas()} hitSlop={8}>
                  <Text className="font-roboto text-[10px] tracking-[2px] text-marca">
                    MARCAR TODAS
                  </Text>
                </Pressable>
              ) : null}
            </View>

            <ScrollView
              style={{ maxHeight: 460 }}
              contentContainerStyle={{ paddingBottom: 28 + insets.bottom }}
              showsVerticalScrollIndicator={false}>
              {tab.items.length === 0 ? (
                <View className="items-center px-8 py-14">
                  <View className="mb-5 h-14 w-14 items-center justify-center border border-oro bg-marca-oscura">
                    <IconoNav name="notifications-outline" size={22} color={colores.oro} />
                  </View>
                  <Text className="text-center font-serif-light text-2xl text-tinta">
                    Sin avisos por ahora
                  </Text>
                  <Text className="mt-3 text-center font-roboto text-sm leading-6 text-tinta/60">
                    Cuando haya un pedido, una reserva o un domicilio listo, suena aquí con estilo
                    de casa.
                  </Text>
                </View>
              ) : (
                tab.items.map((item) => {
                  const leida = Boolean(item.readAt);
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => void abrir(item)}
                      className={`border-b border-madera/10 px-6 py-4 ${
                        leida ? 'opacity-70' : 'bg-oro/12'
                      }`}>
                      <View className="flex-row items-start gap-3">
                        <View
                          className={`mt-0.5 h-12 w-12 items-center justify-center border ${
                            leida ? 'border-madera/25 bg-white' : 'border-oro bg-marca-oscura'
                          }`}>
                          <IconoNav
                            name={iconoDeKind(item.kind)}
                            size={18}
                            color={leida ? colores.marca : colores.oro}
                          />
                        </View>
                        <View className="flex-1">
                          <Text className="font-roboto text-[10px] tracking-[2px] text-marca">
                            {selloDeKind(item.kind)}
                            {formatoHoraAviso(item.createdAt)
                              ? ` · ${formatoHoraAviso(item.createdAt)}`
                              : ''}
                          </Text>
                          <Text className="mt-1 font-serif text-[20px] leading-6 text-tinta">
                            {item.title}
                          </Text>
                          <Text className="mt-1.5 font-roboto text-sm leading-5 text-tinta/70">
                            {item.body}
                          </Text>
                        </View>
                        {!leida ? (
                          <View className="mt-2 h-2.5 w-2.5 rounded-full bg-marca" />
                        ) : null}
                      </View>
                    </Pressable>
                  );
                })
              )}
            </ScrollView>
          </Pergamino>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
