import { type ComponentProps, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { PuntosTicket } from '@/features/inicio/components/MesaDecor';
import { IconoNav } from '@/shared/components/nav-bar/IconoNav';

type NombreIcono = ComponentProps<typeof IconoNav>['name'];

export function FilaStat({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View className="flex-row items-baseline border-b border-white/10 py-4">
      <Text className="w-[140px] text-[10px] tracking-[2px] text-crema">{etiqueta}</Text>
      <View className="mx-2 mb-1 h-px flex-1 bg-oro" />
      <Text className="text-right text-[22px] font-light text-white">{valor}</Text>
    </View>
  );
}

export function ChipFiltro({
  etiqueta,
  activo,
  onPress,
}: {
  etiqueta: string;
  activo: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} className={`mb-2 mr-2 px-3 py-2 ${activo ? 'bg-oro' : 'border border-oro/30'}`}>
      <Text className={`text-[10px] tracking-[1px] ${activo ? 'text-marca-oscura' : 'text-crema/70'}`}>{etiqueta}</Text>
    </Pressable>
  );
}

export function EnlaceAdmin({
  etiqueta,
  onPress,
  peligro,
}: {
  etiqueta: string;
  onPress: () => void;
  peligro?: boolean;
}) {
  return (
    <Pressable onPress={onPress} className="py-1 pr-4">
      <Text className={`text-[11px] tracking-[2px] ${peligro ? 'text-red-300' : 'text-oro'}`}>{etiqueta}</Text>
    </Pressable>
  );
}

export function AccionesAdmin({ children }: { children: ReactNode }) {
  return <View className="mt-3 flex-row flex-wrap items-center">{children}</View>;
}

export function ModalAdmin({
  visible,
  titulo,
  onCerrar,
  children,
}: {
  visible: boolean;
  titulo: string;
  onCerrar: () => void;
  children: ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCerrar}>
      <Pressable onPress={onCerrar} className="flex-1 justify-end bg-marca-oscura/80">
        <Pressable onPress={() => {}} className="max-h-[88%] bg-crema px-5 pb-8 pt-6">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="flex-1 text-2xl font-light text-marca-oscura">{titulo}</Text>
            <Pressable onPress={onCerrar} className="h-10 w-10 items-center justify-center">
              <IconoNav name="close" size={20} className="text-marca-oscura" />
            </Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled">{children}</ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function ComandaAdmin({ children }: { children: ReactNode }) {
  return (
    <View className="bg-crema px-5 py-5">
      <PuntosTicket />
      <View className="my-5">{children}</View>
      <PuntosTicket />
    </View>
  );
}

export function EstadoVacioAdmin({
  icono,
  titulo,
  texto,
}: {
  icono: NombreIcono;
  titulo: string;
  texto: string;
}) {
  return (
    <View className="py-4">
      <View className="mb-4 h-px w-12 bg-oro" />
      <IconoNav name={icono} size={22} className="text-oro" />
      <Text className="mt-3 text-2xl font-light text-crema">{titulo}</Text>
      <Text className="mt-2 text-sm leading-5 text-crema/55">{texto}</Text>
    </View>
  );
}
