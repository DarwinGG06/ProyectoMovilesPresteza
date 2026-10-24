import { router } from 'expo-router';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatCOP, useCart } from '@/services/cart/CartContext';
import { Pergamino } from '@/shared/components/materiales/Pergamino';
import { SelloLacre } from '@/shared/components/materiales/SelloLacre';
import { SelloP } from '@/shared/components/nav-bar/SelloP';

type CartSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function CartSheet({ visible, onClose }: CartSheetProps) {
  const { items, totalPrice, updateQuantity, removeItem } = useCart();
  const insets = useSafeAreaInsets();
  const vacia = items.length === 0;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-marca-oscura/55">
        <Pressable className="flex-1" onPress={onClose} />
        <View className="overflow-hidden border-t border-madera/20">
          <Pergamino>
            <View className="items-center pt-3">
              <View className="h-1 w-10 rounded-full bg-madera/30" />
            </View>

            <View className="flex-row items-end justify-between px-6 pb-2 pt-4">
              <View>
                <Text className="font-roboto text-[10px] tracking-[3px] text-marca">TU PEDIDO</Text>
                <Text className="mt-1 font-serif-light text-[34px] leading-9 text-tinta">
                  La bandeja
                </Text>
              </View>
              <Pressable onPress={onClose} className="py-1" accessibilityRole="button">
                <Text className="font-roboto text-[11px] tracking-[2px] text-marca">CERRAR</Text>
              </Pressable>
            </View>
            <View className="mx-6 mb-2 h-px w-10 bg-marca/35" />

            {vacia ? (
              <View className="items-center px-6 pb-2 pt-6" style={{ paddingBottom: Math.max(insets.bottom, 24) }}>
                <SelloP size="md" />
                <Text className="mt-5 text-center font-serif-light text-2xl text-tinta">
                  Aún no hay nada
                </Text>
                <Text className="mt-2 text-center font-roboto text-sm leading-5 text-tinta/70">
                  Elige un plato en la carta y vuelve a la bandeja.
                </Text>
                <View className="mt-6 w-full">
                  <SelloLacre
                    texto="VER LA CARTA"
                    onPress={() => {
                      onClose();
                      router.push('/home/menu');
                    }}
                  />
                </View>
              </View>
            ) : (
              <>
                <ScrollView className="max-h-[44%] px-6">
                  {items.map((item, index) => (
                    <View key={item.id} className="border-b border-madera/20 py-4">
                      <View className="flex-row items-baseline">
                        <Text className="w-8 font-roboto text-[10px] tracking-[1px] text-marca">
                          {String(index + 1).padStart(2, '0')}
                        </Text>
                        <Text className="flex-1 font-serif-semibold text-[22px] leading-6 text-tinta">
                          {item.productName}
                        </Text>
                        <Text className="font-roboto text-marca">{formatCOP(item.totalPrice)}</Text>
                      </View>
                      {item.selectedOptions?.length ? (
                        <Text className="ml-8 mt-1 font-roboto text-xs text-tinta/70">
                          {item.selectedOptions.map((option) => option.name).join(' · ')}
                        </Text>
                      ) : null}
                      <View className="ml-8 mt-3 flex-row items-center">
                        <Pressable
                          onPress={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="pr-3 active:opacity-70 disabled:opacity-35">
                          <Text className="font-serif text-2xl leading-7 text-tinta">−</Text>
                        </Pressable>
                        <Text className="min-w-[28px] text-center font-serif-italic text-xl text-tinta">
                          {item.quantity}
                        </Text>
                        <Pressable
                          onPress={() => updateQuantity(item.id, item.quantity + 1)}
                          className="pl-3 active:opacity-70">
                          <Text className="font-serif text-2xl leading-7 text-tinta">+</Text>
                        </Pressable>
                        <Pressable onPress={() => removeItem(item.id)} className="ml-auto py-1">
                          <Text className="font-roboto text-[10px] tracking-[2px] text-marca">QUITAR</Text>
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </ScrollView>

                <View className="px-6 pt-5" style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
                  <View className="mb-4 flex-row items-end justify-between">
                    <Text className="font-roboto text-[10px] tracking-[3px] text-marca">TOTAL</Text>
                    <Text className="font-serif-light text-[32px] leading-9 text-tinta">
                      {formatCOP(totalPrice)}
                    </Text>
                  </View>
                  <SelloLacre
                    texto="CONFIRMAR PEDIDO"
                    onPress={() => {
                      onClose();
                      router.push('/pago');
                    }}
                  />
                </View>
              </>
            )}
          </Pergamino>
        </View>
      </View>
    </Modal>
  );
}
