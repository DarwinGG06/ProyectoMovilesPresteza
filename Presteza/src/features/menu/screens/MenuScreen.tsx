import React from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, View } from 'react-native';

import { ChipCategoria } from '@/components/ChipCategoria';
import { Footer } from '@/shared/components/footer';
import { EvitarTeclado } from '@/shared/components/evitar-teclado/EvitarTeclado';
import { Pergamino } from '@/shared/components/materiales/Pergamino';
import { SelloP } from '@/shared/components/nav-bar/SelloP';

import { ModelViewerModal } from '../components/ModelViewerModal';
import { TarjetaPlato } from '../components/TarjetaPlato';
import { useMenu } from '../hooks/useMenu';

export function MenuScreen() {
  const menu = useMenu();

  if (menu.mostrarCarga) {
    return (
      <View className="flex-1 items-center justify-center bg-pergamino">
        <SelloP size="lg" />
        <View className="mt-6">
          <ActivityIndicator color="#6b1d3d" />
        </View>
        <Text className="mt-3 font-roboto text-sm text-tinta/60">Abriendo la carta...</Text>
      </View>
    );
  }

  return (
    <EvitarTeclado>
      <Pergamino fill>
        <View className="flex-1">
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag">
            <View className="items-center px-8 pb-8 pt-14">
              <Text className="font-roboto text-[10px] tracking-[4px] text-marca">
                PRESTEZA · MILÁN
              </Text>
              <Text className="mt-3 font-serif-light text-[44px] leading-[46px] text-tinta">
                La carta
              </Text>
              <View className="mt-5 h-px w-10 bg-marca/35" />
              <Text className="mt-5 max-w-[260px] text-center font-serif-italic text-[17px] text-tinta/55">
                Lo que sale de cocina, escrito a mano.
              </Text>
            </View>

            <View className="px-6 pb-12">
              {menu.error ? (
                <Text className="mb-4 text-center font-roboto text-sm text-red-800">
                  {menu.error}
                </Text>
              ) : null}

              <TextInput
                className="mb-6 border-b border-madera/30 bg-transparent py-3 font-roboto text-tinta"
                placeholder="Buscar un plato..."
                placeholderTextColor="rgba(42, 24, 16, 0.4)"
                value={menu.busqueda}
                onChangeText={menu.setBusqueda}
              />

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-2"
                contentContainerStyle={{ gap: 8, paddingBottom: 8 }}>
                <ChipCategoria
                  etiqueta="Todos"
                  activo={menu.categoriaActiva === null}
                  onPress={() => menu.elegirCategoria(null)}
                />
                {menu.categorias.map((cat) => {
                  const id = cat.id || cat._id || null;
                  return (
                    <ChipCategoria
                      key={id}
                      etiqueta={cat.name}
                      activo={menu.categoriaActiva === id}
                      onPress={() => menu.elegirCategoria(id)}
                    />
                  );
                })}
              </ScrollView>

              {menu.productos.length === 0 ? (
                <View className="items-center py-12">
                  <Text className="font-serif-italic text-lg text-tinta/55">
                    No hay platos en esta página.
                  </Text>
                </View>
              ) : (
                menu.productos.map((producto, index) => (
                  <TarjetaPlato
                    key={producto.id || producto._id}
                    producto={producto}
                    indice={index}
                    tieneModelo={menu.tieneModelo(producto)}
                    onVerModelo={() => menu.abrirVisor(producto)}
                  />
                ))
              )}
            </View>
            <Footer />
          </ScrollView>
        </View>
      </Pergamino>

      <ModelViewerModal
        isVisible={menu.visorAbierto}
        onClose={menu.cerrarVisor}
        modelUrl={menu.modeloUrl}
        productName={menu.nombreProducto}
      />
    </EvitarTeclado>
  );
}
