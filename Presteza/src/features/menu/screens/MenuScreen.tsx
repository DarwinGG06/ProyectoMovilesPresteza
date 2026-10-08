import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Footer } from '@/shared/components/footer';
import { EvitarTeclado } from '@/shared/components/evitar-teclado/EvitarTeclado';
import { SelloP } from '@/shared/components/nav-bar/SelloP';
import { ModelViewerModal } from '@/features/menu/components/ModelViewerModal';

import { useMenu } from '../hooks/useMenu';

export function MenuScreen() {
  const menu = useMenu();

  if (menu.mostrarCarga) {
    return (
      <View className="flex-1 items-center justify-center bg-marca-oscura">
        <SelloP size="lg" />
        <View className="mt-6">
          <ActivityIndicator color="#d4af77" />
        </View>
        <Text className="mt-3 font-roboto text-sm text-crema/70">Preparando el menú...</Text>
      </View>
    );
  }

  return (
    <EvitarTeclado>
      <View className="flex-1 bg-marca-oscura">
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag">
          <View className="items-center px-5 pb-6 pt-10">
            <SelloP size="md" />
            <Text className="mt-4 font-roboto-bold text-3xl text-[#d4af77]">Nuestro Menú</Text>
            <Text className="mt-2 text-center font-roboto text-crema/70">
              Descubre nuestros deliciosos platos y acompañantes.
            </Text>
          </View>

          <View className="px-5 pb-10">
            {menu.error && (
              <Text className="mb-4 text-center font-roboto text-sm text-red-300">
                {menu.error}
              </Text>
            )}

            {/* Buscador */}
            <View className="mb-6">
              <TextInput
                className="rounded-lg border border-[#d4af77]/30 bg-black/30 px-4 py-3 font-roboto text-crema"
                placeholder="Buscar un plato, ingrediente..."
                placeholderTextColor="rgba(212, 175, 119, 0.5)"
                value={menu.busqueda}
                onChangeText={menu.setBusqueda}
              />
            </View>

            {/* Categorías */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-6"
              contentContainerStyle={{ gap: 10 }}>
              <TouchableOpacity
                onPress={() => menu.elegirCategoria(null)}
                className={`rounded-full border px-4 py-2 ${
                  menu.categoriaActiva === null
                    ? 'border-[#d4af77] bg-[#d4af77]'
                    : 'border-[#d4af77]/50 bg-transparent'
                }`}>
                <Text
                  className={
                    menu.categoriaActiva === null
                      ? 'font-roboto-bold text-black'
                      : 'font-roboto text-[#d4af77]'
                  }>
                  Todos
                </Text>
              </TouchableOpacity>

              {menu.categorias.map((cat) => (
                <TouchableOpacity
                  key={cat.id || cat._id}
                  onPress={() => menu.elegirCategoria(cat.id || cat._id || null)}
                  className={`rounded-full border px-4 py-2 ${
                    menu.categoriaActiva === (cat.id || cat._id)
                      ? 'border-[#d4af77] bg-[#d4af77]'
                      : 'border-[#d4af77]/50 bg-transparent'
                  }`}>
                  <Text
                    className={
                      menu.categoriaActiva === (cat.id || cat._id)
                        ? 'font-roboto-bold text-black'
                        : 'font-roboto text-[#d4af77]'
                    }>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Lista de productos */}
            {menu.productos.length === 0 ? (
              <View className="items-center py-10">
                <Text className="font-roboto text-crema/70">
                  No encontramos productos que coincidan.
                </Text>
              </View>
            ) : (
              <View className="flex-col gap-4">
                {menu.productos.map((producto) => (
                  <View
                    key={producto.id || producto._id}
                    className="flex-row items-center rounded-xl border border-white/5 bg-black/20 p-4">
                    <View className="relative mr-4 h-24 w-24">
                      {producto.imageUrl ? (
                        <Image
                          source={{ uri: producto.imageUrl }}
                          className="h-full w-full rounded-lg bg-black/50"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="h-full w-full items-center justify-center rounded-lg bg-black/50">
                          <SelloP size="sm" />
                        </View>
                      )}

                      <TouchableOpacity
                        className="absolute bottom-1 right-1 rounded-full border border-[#d4af77]/50 bg-black/70 p-1.5"
                        onPress={() => menu.abrirVisor(producto)}>
                        <Ionicons name="cube-outline" size={16} color="#d4af77" />
                      </TouchableOpacity>
                    </View>

                    <View className="flex-1 justify-center">
                      <Text className="mb-1 font-roboto-bold text-lg text-crema">
                        {producto.name}
                      </Text>
                      {producto.description && (
                        <Text className="mb-2 font-roboto text-sm text-crema/60" numberOfLines={2}>
                          {producto.description}
                        </Text>
                      )}
                      <Text className="font-roboto-bold text-base text-[#d4af77]">
                        ${(Number(producto.price) || 0).toLocaleString('es-CO')}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
          <Footer />
        </ScrollView>

        <ModelViewerModal
          isVisible={menu.visorAbierto}
          onClose={menu.cerrarVisor}
          modelUrl={menu.modeloUrl}
          productName={menu.nombreProducto}
        />
      </View>
    </EvitarTeclado>
  );
}
