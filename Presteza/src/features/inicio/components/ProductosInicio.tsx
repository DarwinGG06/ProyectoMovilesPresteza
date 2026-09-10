import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { formatCOP, useCart } from '@/services/cart/CartContext';

import { PRODUCTOS_DESTACADOS } from '../data';
import { MarcaCurso, Plato } from './MesaDecor';

export function ProductosInicio() {
  const { addItem } = useCart();
  const [principal, segundo, postre] = PRODUCTOS_DESTACADOS;

  return (
    <View className="bg-marca-oscura px-5 pb-12">
      <MarcaCurso numero="II" nombre="DESTACADOS" />
      <Text className="mb-4 text-sm text-crema/55">Toca un plato para añadirlo al pedido.</Text>

      <View className="h-[300px]">
        <Pressable
          onPress={() =>
            addItem({ id: principal.id, productName: principal.name, unitPrice: principal.price })
          }
          className="absolute left-0 top-8">
          <Plato uri={principal.imageUrl} size={210} />
        </Pressable>

        <Pressable
          onPress={() => addItem({ id: segundo.id, productName: segundo.name, unitPrice: segundo.price })}
          className="absolute right-2 top-0">
          <Plato uri={segundo.imageUrl} size={132} />
        </Pressable>

        <Pressable
          onPress={() => addItem({ id: postre.id, productName: postre.name, unitPrice: postre.price })}
          className="absolute bottom-0 right-8">
          <Plato uri={postre.imageUrl} size={118} />
        </Pressable>
      </View>

      <View className="mt-6">
        {PRODUCTOS_DESTACADOS.map((producto, index) => (
          <Pressable
            key={producto.id}
            onPress={() =>
              addItem({ id: producto.id, productName: producto.name, unitPrice: producto.price })
            }
            className="flex-row items-baseline justify-between border-b border-oro/20 py-3">
            <View className="flex-1 pr-3">
              <Text className="text-[10px] text-oro/70">{producto.badge}</Text>
              <Text className="text-lg font-light text-crema">{producto.name}</Text>
            </View>
            <Text className="text-oro">{formatCOP(producto.price)}</Text>
            <Text className="ml-3 text-[10px] text-crema/40">0{index + 1}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable onPress={() => router.push('/menu')} className="mt-6 self-start">
        <Text className="text-[11px] tracking-[3px] text-oro">VER EL MENÚ COMPLETO →</Text>
      </Pressable>
    </View>
  );
}
