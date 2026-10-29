import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SectionList,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Footer } from '@/shared/components/footer';
import { EvitarTeclado } from '@/shared/components/evitar-teclado/EvitarTeclado';
import { Pergamino } from '@/shared/components/materiales/Pergamino';
import { SelloP } from '@/shared/components/nav-bar/SelloP';

import { ModalAdmin } from '@/features/administracion/components/elementos';
import { FormularioProducto } from '@/features/administracion/components/formularios/FormularioProducto';
import { idDe } from '@/api/helpers';

import { ModelViewerModal } from '../components/ModelViewerModal';
import { TarjetaCategoria } from '../components/TarjetaCategoria';
import { TarjetaPlato } from '../components/TarjetaPlato';
import { useCartaAdmin } from '../hooks/useCartaAdmin';
import { useMenu } from '../hooks/useMenu';

export function MenuScreen() {
  const menu = useMenu();
  const admin = useCartaAdmin(menu.recargar, menu.categorias);

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

  const encabezado = (
    <EncabezadoCarta
      error={menu.error}
      busqueda={menu.busqueda}
      onBusqueda={menu.setBusqueda}
      categoria={menu.viendoCategorias ? null : menu.secciones[0]?.title}
      onVolver={menu.viendoCategorias ? undefined : () => menu.elegirCategoria(null)}
    />
  );

  return (
    <EvitarTeclado>
      <Pergamino fill>
        <View className="flex-1">
          {menu.viendoCategorias ? (
            <FlatList
              data={menu.portadas}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperClassName="justify-between px-6"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              refreshing={menu.refrescando}
              onRefresh={menu.recargar}
              ListHeaderComponent={encabezado}
              renderItem={({ item }) => (
                <TarjetaCategoria portada={item} onPress={() => menu.elegirCategoria(item.id)} />
              )}
              ListEmptyComponent={
                <Vacio
                  texto={menu.error ? 'No se pudo abrir la carta.' : 'Aún no hay categorías.'}
                />
              }
              ListFooterComponent={<Footer />}
            />
          ) : (
            <SectionList
              sections={menu.secciones}
              keyExtractor={(producto) => producto.id || producto._id || producto.name}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              stickySectionHeadersEnabled={false}
              refreshing={menu.refrescando}
              onRefresh={menu.recargar}
              ListHeaderComponent={encabezado}
              renderItem={({ item, index }) => (
                <View className="px-6">
                  <TarjetaPlato
                    producto={item}
                    indice={index}
                    tieneModelo={menu.tieneModelo(item)}
                    onVerModelo={() => menu.abrirVisor(item)}
                    onEditar={admin.esAdmin ? () => admin.abrirEditar(item) : undefined}
                    onEliminar={admin.esAdmin ? () => admin.eliminar(item) : undefined}
                  />
                </View>
              )}
              ListEmptyComponent={
                <Vacio
                  texto={
                    menu.error ? 'No se pudo abrir la carta.' : 'No hay platos en esta página.'
                  }
                />
              }
              ListFooterComponent={<Footer />}
            />
          )}
        </View>
      </Pergamino>

      <ModelViewerModal
        isVisible={menu.visorAbierto}
        onClose={menu.cerrarVisor}
        modelUrl={menu.modeloUrl}
        productName={menu.nombreProducto}
      />
      <ModalAdmin visible={admin.abierto} titulo="Editar plato" onCerrar={admin.cerrar}>
        <FormularioProducto
          key={idDe(admin.editando) || 'editar'}
          valores={admin.valoresFormulario}
          categorias={admin.categorias}
          adicionales={admin.adicionales}
          onCancelar={admin.cerrar}
          onGuardar={admin.guardar}
          guardando={admin.guardando}
        />
      </ModalAdmin>
    </EvitarTeclado>
  );
}

function EncabezadoCarta({
  error,
  busqueda,
  onBusqueda,
  categoria,
  onVolver,
}: {
  error?: string | null;
  busqueda: string;
  onBusqueda: (texto: string) => void;
  categoria?: string | null;
  onVolver?: () => void;
}) {
  return (
    <View>
      <View className="items-center px-8 pb-8 pt-14">
        <Text className="font-roboto text-[10px] tracking-[4px] text-marca">PRESTEZA · MILÁN</Text>
        <Text className="mt-3 font-serif-light text-[44px] leading-[46px] text-tinta">
          La carta
        </Text>
        <View className="mt-5 h-px w-10 bg-marca/35" />
        <Text className="mt-5 max-w-[260px] text-center font-serif-italic text-[17px] text-tinta/70">
          {categoria ? categoria : 'Elige una página de la carta.'}
        </Text>
      </View>

      <View className="px-6">
        {error ? (
          <Text className="mb-4 text-center font-roboto text-sm text-red-800">{error}</Text>
        ) : null}

        {onVolver ? (
          <Pressable
            onPress={() => {
              onBusqueda('');
              onVolver();
            }}
            accessibilityRole="button"
            className="mb-4 min-h-12 justify-center self-start">
            <Text className="font-roboto text-[11px] tracking-[2px] text-marca">← CATEGORÍAS</Text>
          </Pressable>
        ) : null}

        <TextInput
          className="mb-6 border-b border-madera/30 bg-transparent py-3 font-roboto text-tinta"
          placeholder="Buscar un plato..."
          placeholderTextColor="rgba(42, 24, 16, 0.4)"
          value={busqueda}
          onChangeText={onBusqueda}
        />
      </View>
    </View>
  );
}

function Vacio({ texto }: { texto: string }) {
  return (
    <View className="items-center px-6 py-12">
      <Text className="font-serif-italic text-lg text-tinta/70">{texto}</Text>
    </View>
  );
}
