import { router } from 'expo-router';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatCOP, useCart } from '@/services/cart/CartContext';
import { Pergamino } from '@/shared/components/materiales/Pergamino';
import { SelloLacre } from '@/shared/components/materiales/SelloLacre';

import { IconoNav } from './IconoNav';

type CartSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function CartSheet({ visible, onClose }: CartSheetProps) {
  const { items, totalPrice, updateQuantity, removeItem } = useCart();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-marca-oscura/55">
        <Pressable className="flex-1" onPress={onClose} />
        <Pergamino>
          <View className="items-center pt-3">
            <View className="h-px w-10 bg-madera/40" />
          </View>

          <View className="flex-row items-end justify-between px-6 pb-4 pt-4">
            <View>
              <Text className="font-roboto text-[10px] tracking-[3px] text-marca">TU PEDIDO</Text>
              <Text className="font-serif-light text-[34px] leading-9 text-tinta">La bandeja</Text>
            </View>
            <Pressable
              onPress={onClose}
              className="h-10 w-10 items-center justify-center border border-madera/30">
              <IconoNav name="close" size={18} className="text-tinta" />
            </Pressable>
          </View>

          <ScrollView className="max-h-[46%] px-6">
            {items.length === 0 ? (
              <View className="items-center py-12">
                <Text className="font-serif-italic text-xl text-tinta">Aún no hay sabores</Text>
                <Text className="mt-2 text-center font-roboto text-sm text-tinta/55">
                  Empieza por un plato de la carta.
                </Text>
              </View>
            ) : (
              items.map((item, index) => (
                <View key={item.id} className="border-b border-madera/20 py-4">
                  <View className="flex-row items-baseline">
                    <Text className="w-7 font-roboto text-[10px] text-marca">
                      {String(index + 1).padStart(2, '0')}
                    </Text>
                    <Text className="flex-1 font-serif-semibold text-xl text-tinta">
                      {item.productName}
                    </Text>
                    <Text className="font-roboto text-marca">{formatCOP(item.totalPrice)}</Text>
                  </View>
                  {item.selectedOptions?.length ? (
                    <Text className="ml-7 mt-1 font-roboto text-xs text-tinta/50">
                      {item.selectedOptions.map((option) => option.name).join(' · ')}
                    </Text>
                  ) : null}
                  <View className="ml-7 mt-3 flex-row items-center justify-between">
                    <View className="flex-row items-center border border-madera/25">
                      <Pressable
                        onPress={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="h-8 w-8 items-center justify-center disabled:opacity-40">
                        <IconoNav name="remove" size={16} className="text-tinta" />
                      </Pressable>
                      <Text className="min-w-[24px] text-center font-roboto text-tinta">
                        {item.quantity}
                      </Text>
                      <Pressable
                        onPress={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-8 w-8 items-center justify-center">
                        <IconoNav name="add" size={16} className="text-tinta" />
                      </Pressable>
                    </View>
                    <Pressable onPress={() => removeItem(item.id)}>
                      <IconoNav name="trash-outline" size={18} className="text-marca/60" />
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          {items.length > 0 ? (
            <View className="items-center px-6 pt-5" style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
              <View className="mb-5 w-full flex-row items-end justify-between">
                <Text className="font-roboto text-[10px] tracking-[3px] text-marca">TOTAL</Text>
                <Text className="font-serif-light text-[32px] leading-9 text-tinta">
                  {formatCOP(totalPrice)}
                </Text>
              </View>
              <SelloLacre
                texto="LLEVAR A LA MESA"
                onPress={() => {
                  onClose();
                  router.push('/pago');
                }}
              />
            </View>
          ) : (
            <View style={{ height: insets.bottom }} />
          )}
        </Pergamino>
      </View>
    </Modal>
  );
}
