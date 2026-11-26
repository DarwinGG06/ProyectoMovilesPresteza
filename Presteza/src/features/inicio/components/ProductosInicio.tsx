import { router } from 'expo-router';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { formatCOP } from '@/services/cart/CartContext';

import { MarcaCurso, Plato } from './MesaDecor';

type Destacado = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  badge: string;
};

type Props = {
  destacados: Destacado[];
  cargando: boolean;
};

const TAMANOS = [210, 132, 118] as const;
const POSICIONES = [
  'absolute left-0 top-8',
  'absolute right-2 top-0',
  'absolute bottom-0 right-8',
] as const;

export function ProductosInicio({ destacados, cargando }: Props) {
  const irAlPlato = (id: string) => {
    if (!id) {
      router.push('/home/menu');
      return;
    }
    router.push({ pathname: '/plato/[id]', params: { id } });
  };

  return (
    <View className="bg-marca-oscura px-5 pb-12">
      <MarcaCurso numero="II" nombre="DESTACADOS" />
      <Text className="mb-4 font-roboto text-sm text-crema/70">
        Toca un plato para ver la carta.
      </Text>

      {cargando ? (
        <View className="h-[200px] items-center justify-center">
          <ActivityIndicator color="#d4af77" />
        </View>
      ) : destacados.length === 0 ? (
        <View className="border border-oro/25 px-4 py-6">
          <Text className="font-serif text-lg text-crema">Aún no hay platos en carta.</Text>
          <Text className="mt-2 font-roboto text-sm text-crema/70">
            Cuando el admin publique platos, aparecen aquí.
          </Text>
        </View>
      ) : (
        <>
          <View className="h-[300px]">
            {destacados.map((producto, index) => (
              <Pressable
                key={producto.id || index}
                onPress={() => irAlPlato(producto.id)}
                className={POSICIONES[index] || POSICIONES[0]}>
                {producto.imageUrl ? (
                  <Plato uri={producto.imageUrl} size={TAMANOS[index] || 118} />
                ) : (
                  <View
                    style={{
                      width: TAMANOS[index] || 118,
                      height: TAMANOS[index] || 118,
                      borderRadius: (TAMANOS[index] || 118) / 2,
                      borderWidth: 1,
                      borderColor: '#d4af77',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#2a0818',
                    }}>
                    <Text className="px-3 text-center font-roboto text-[12px] text-oro">
                      {producto.name}
                    </Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>

          <View className="mt-6">
            {destacados.map((producto, index) => (
              <Pressable
                key={producto.id || `lista-${index}`}
                onPress={() => irAlPlato(producto.id)}
                className="flex-row items-baseline justify-between border-b border-oro/20 py-3">
                <View className="flex-1 pr-3">
                  <Text className="font-roboto text-[12px] text-oro/70">{producto.badge}</Text>
                  <Text className="font-serif text-lg text-crema">{producto.name}</Text>
                </View>
                <Text className="font-roboto text-oro">{formatCOP(producto.price)}</Text>
                <Text className="ml-3 font-roboto text-[12px] text-crema/70">0{index + 1}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      <Pressable onPress={() => router.push('/home/menu')} className="mt-6 self-start">
        <Text className="font-roboto text-[13px] tracking-[3px] text-oro">
          VER EL MENÚ COMPLETO →
        </Text>
      </Pressable>
    </View>
  );
}
