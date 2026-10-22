import { Image, Pressable, ScrollView, Text, View } from 'react-native';

import Button from '@/components/Button';
import { EvitarTeclado } from '@/shared/components/evitar-teclado/EvitarTeclado';
import { Footer } from '@/shared/components/footer';
import { Pergamino } from '@/shared/components/materiales/Pergamino';
import { SelloP } from '@/shared/components/nav-bar/SelloP';

import { ModelViewerModal } from '../components/ModelViewerModal';
import { useDetallePlato } from '../hooks/useDetallePlato';

export function DetallePlatoScreen() {
  const plato = useDetallePlato();

  if (plato.cargando) {
    return (
      <View className="flex-1 items-center justify-center bg-pergamino">
        <SelloP size="md" />
        <Text className="mt-4 font-roboto text-sm text-tinta/70">Abriendo el plato...</Text>
      </View>
    );
  }

  if (!plato.producto) {
    return (
      <View className="flex-1 items-center justify-center bg-pergamino px-6">
        <Text className="text-center font-serif-light text-2xl text-tinta">
          {plato.error || 'Ese plato no está en la carta.'}
        </Text>
        <Pressable onPress={plato.volver} className="mt-6">
          <Text className="font-roboto text-[11px] tracking-[2px] text-marca">VOLVER A LA CARTA</Text>
        </Pressable>
      </View>
    );
  }

  const producto = plato.producto;

  return (
    <EvitarTeclado>
      <Pergamino fill>
        <ScrollView showsVerticalScrollIndicator={false}>
          {producto.imageUrl ? (
            <Image source={{ uri: producto.imageUrl }} className="h-64 w-full bg-madera/15" resizeMode="cover" />
          ) : (
            <View className="h-48 items-center justify-center bg-madera/15">
              <SelloP size="lg" />
            </View>
          )}

          <View className="px-6 pb-16 pt-6">
            <Pressable onPress={plato.volver} className="self-start py-1 active:opacity-80">
              <Text className="font-roboto text-[11px] tracking-[2px] text-marca">← CARTA</Text>
            </Pressable>

            <Text className="mt-4 font-roboto text-[10px] tracking-[4px] text-marca">EL PLATO</Text>
            <Text className="mt-2 font-serif-light text-[36px] leading-[40px] text-tinta">
              {producto.name}
            </Text>
            <View className="mt-4 h-px w-10 bg-marca/35" />

            {producto.description ? (
              <Text className="mt-5 font-roboto text-[15px] leading-6 text-tinta/70">
                {producto.description}
              </Text>
            ) : null}

            <Text className="mt-5 font-serif-light text-3xl text-marca">{plato.precio}</Text>

            {plato.tieneModelo ? (
              <Button className="mt-6" secondary text="VER EN 3D" onPress={plato.abrirVisor} />
            ) : null}

            {plato.enBandeja ? (
              <Text className="mt-5 font-roboto text-sm text-tinta">Ya está en la bandeja.</Text>
            ) : null}

            <Button className="mt-4" variant="gold" text="A LA BANDEJA" onPress={plato.agregar} />
            {plato.enBandeja ? (
              <Button className="mt-3" variant="secondary" text="IR A PAGAR" onPress={plato.irABandeja} />
            ) : null}
          </View>
          <Footer />
        </ScrollView>
      </Pergamino>

      <ModelViewerModal
        isVisible={plato.visorAbierto}
        onClose={plato.cerrarVisor}
        modelUrl={producto.modelUrl ?? null}
        productName={producto.name}
      />
    </EvitarTeclado>
  );
}
