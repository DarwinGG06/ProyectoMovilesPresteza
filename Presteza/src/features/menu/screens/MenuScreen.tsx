import React from 'react';
import { ActivityIndicator, SectionList, Text, TextInput, View } from 'react-native';

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
        <Text className="mt-3 font-roboto text-sm text-tinta/70">Abriendo la carta...</Text>
      </View>
    );
  }

  return (
    <EvitarTeclado>
      <Pergamino fill>
        <View className="flex-1">
          <SectionList
            sections={menu.secciones}
            keyExtractor={(producto) => producto.id || producto._id || producto.name}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            stickySectionHeadersEnabled={false}
            refreshing={menu.refrescando}
            onRefresh={menu.recargar}
            renderItem={({ item, index }) => (
              <View className="px-6">
                <TarjetaPlato
                  producto={item}
                  indice={index}
                  tieneModelo={menu.tieneModelo(item)}
                  onVerModelo={() => menu.abrirVisor(item)}
                />
              </View>
            )}
            renderSectionHeader={({ section }) => (
              <View className="px-6 pb-1 pt-6">
                <Text className="font-roboto text-[10px] tracking-[3px] text-marca">
                  {section.title.toUpperCase()}
                </Text>
              </View>
            )}
            ListHeaderComponent={
              <View>
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

                <View className="px-6">
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

                  <View className="mb-2 flex-row flex-wrap gap-2 pb-2">
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
                  </View>
                </View>
              </View>
            }
            ListEmptyComponent={
              <View className="items-center px-6 py-12">
                <Text className="font-serif-italic text-lg text-tinta/55">
                  {menu.error ? 'No se pudo abrir la carta.' : 'No hay platos en esta página.'}
                </Text>
              </View>
            }
            ListFooterComponent={<Footer />}
          />
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
