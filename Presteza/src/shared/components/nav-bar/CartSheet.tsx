import { router } from 'expo-router';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { formatCOP, useCart } from '@/services/cart/CartContext';

import { IconoNav } from './IconoNav';

type CartSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function CartSheet({ visible, onClose }: CartSheetProps) {
  const { items, totalPrice, updateQuantity, removeItem } = useCart();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-marca-oscura/55">
        <Pressable className="flex-1" onPress={onClose} />
        <View className="max-h-[82%] overflow-hidden rounded-t-[36px] bg-crema">
          <View className="items-center pt-3">
            <View className="h-1.5 w-12 rounded-full bg-oro/60" />
          </View>

          <View className="flex-row items-end justify-between px-6 pb-4 pt-3">
            <View>
              <Text className="text-[10px] tracking-[3px] text-oro">TU PEDIDO</Text>
              <Text className="text-3xl font-extrabold text-marca-oscura">La bandeja</Text>
            </View>
            <Pressable
              onPress={onClose}
              className="h-10 w-10 items-center justify-center rounded-full border border-oro/50">
              <IconoNav name="close" size={18} className="text-marca-oscura" />
            </Pressable>
          </View>

          <ScrollView className="px-6">
            {items.length === 0 ? (
              <View className="items-center py-14">
                <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-marca-oscura">
                  <IconoNav name="leaf-outline" size={32} className="text-oro" />
                </View>
                <Text className="text-xl font-semibold text-marca-oscura">Aún no hay sabores</Text>
                <Text className="mt-1 text-center text-marca/60">El menú ya está caliente. Empieza por un plato.</Text>
              </View>
            ) : (
              items.map((item) => (
                <View key={item.id} className="mb-3 rounded-3xl bg-white p-4 shadow-sm">
                  <Text className="text-base font-semibold text-marca-oscura">{item.productName}</Text>
                  {item.selectedOptions?.length ? (
                    <View className="mt-2 flex-row flex-wrap gap-2">
                      {item.selectedOptions.map((option) => (
                        <Text
                          key={option.name}
                          className="rounded-full bg-crema px-3 py-1 text-xs text-marca">
                          {option.name}
                        </Text>
                      ))}
                    </View>
                  ) : null}
                  <Text className="mt-2 text-lg font-extrabold text-oro">{formatCOP(item.totalPrice)}</Text>
                  <View className="mt-3 flex-row items-center justify-between">
                    <View className="flex-row items-center rounded-full bg-crema px-2 py-1">
                      <Pressable
                        onPress={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="h-8 w-8 items-center justify-center">
                        <IconoNav name="remove" size={16} className="text-marca-oscura" />
                      </Pressable>
                      <Text className="min-w-[24px] text-center font-bold text-marca-oscura">
                        {item.quantity}
                      </Text>
                      <Pressable
                        onPress={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-8 w-8 items-center justify-center">
                        <IconoNav name="add" size={16} className="text-marca-oscura" />
                      </Pressable>
                    </View>
                    <Pressable onPress={() => removeItem(item.id)}>
                      <IconoNav name="trash-outline" size={18} className="text-marca/50" />
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          {items.length > 0 ? (
            <View className="bg-marca-oscura px-6 pb-8 pt-5">
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="tracking-widest text-oro">TOTAL</Text>
                <Text className="text-3xl font-extrabold text-crema">{formatCOP(totalPrice)}</Text>
              </View>
              <Pressable
                onPress={() => {
                  onClose();
                  router.push('/pago');
                }}
                className="rounded-full bg-oro py-4">
                <Text className="text-center text-base font-extrabold tracking-widest text-marca-oscura">
                  LLEVAR A LA MESA
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
