import { type ComponentProps, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { EvitarTeclado } from '@/shared/components/evitar-teclado/EvitarTeclado';
import { Pergamino } from '@/shared/components/materiales/Pergamino';
import { IconoNav } from '@/shared/components/nav-bar/IconoNav';

type NombreIcono = ComponentProps<typeof IconoNav>['name'];

export function FilaStat({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View className="flex-row items-baseline border-b border-white/10 py-4">
      <Text className="w-[140px] font-roboto text-[10px] tracking-[2px] text-crema">
        {etiqueta}
      </Text>
      <View className="mx-2 mb-1 h-px flex-1 bg-oro" />
      <Text className="text-right font-roboto-light text-[22px] text-white">{valor}</Text>
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
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: activo }}
      className={`mb-2 mr-2 min-h-12 items-center justify-center rounded-full px-3.5 ${activo ? 'bg-marca' : 'border border-madera/20'}`}>
      <Text
        className={`font-roboto text-[10px] tracking-[1px] ${activo ? 'text-crema' : 'text-tinta/70'}`}>
        {etiqueta}
      </Text>
    </Pressable>
  );
}

export function EnlaceAdmin({
  etiqueta,
  onPress,
  peligro,
  activo,
}: {
  etiqueta: string;
  onPress: () => void;
  peligro?: boolean;
  activo?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className={`mb-2 mr-2 min-h-12 items-center justify-center rounded-full px-3.5 ${
        activo
          ? 'bg-marca'
          : peligro
            ? 'border border-red-600/50'
            : 'border border-marca/35'
      }`}>
      <Text
        className={`font-roboto text-[11px] tracking-[1.4px] ${
          activo ? 'text-crema' : peligro ? 'text-red-700' : 'text-marca'
        }`}>
        {etiqueta}
      </Text>
    </Pressable>
  );
}

export function AccionesAdmin({ children }: { children: ReactNode }) {
  return <View className="mt-3 flex-row flex-wrap">{children}</View>;
}

export function BotonAgregarAdmin({
  onPress,
  etiqueta = 'AGREGAR',
}: {
  onPress: () => void;
  etiqueta?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="mb-4 min-h-12 items-center justify-center self-start rounded-full bg-marca px-5">
      <Text className="font-roboto text-[11px] tracking-[1.6px] text-crema">{etiqueta}</Text>
    </Pressable>
  );
}

export function MarcaSeleccion({ marcada }: { marcada: boolean }) {
  return (
    <View
      className={`mr-3 h-6 w-6 items-center justify-center rounded-full ${
        marcada ? 'bg-marca' : 'border border-madera/30'
      }`}>
      {marcada ? <Text className="font-roboto text-[11px] text-crema">✓</Text> : null}
    </View>
  );
}

export function BarraSeleccionAdmin({
  activa,
  cuenta,
  onActivar,
  onCancelar,
  onEliminar,
}: {
  activa: boolean;
  cuenta: number;
  onActivar: () => void;
  onCancelar: () => void;
  onEliminar: () => void;
}) {
  if (!activa) {
    return (
      <Pressable onPress={onActivar} className="mb-4 self-start rounded-full border border-marca/35 px-5 py-2.5">
        <Text className="font-roboto text-[11px] tracking-[1.6px] text-marca">SELECCIONAR</Text>
      </Pressable>
    );
  }

  return (
    <View className="mb-4 flex-row flex-wrap items-center">
      <Text className="mr-3 mb-2 font-roboto text-[13px] text-tinta/55">
        {cuenta === 0 ? 'Elige varios' : `${cuenta} elegidos`}
      </Text>
      <Pressable
        onPress={onEliminar}
        disabled={cuenta === 0}
        className={`mb-2 mr-2 rounded-full px-5 py-2.5 ${cuenta === 0 ? 'bg-marca/30' : 'bg-red-700'}`}>
        <Text className="font-roboto text-[11px] tracking-[1.6px] text-crema">ELIMINAR</Text>
      </Pressable>
      <Pressable onPress={onCancelar} className="mb-2 rounded-full border border-madera/30 px-5 py-2.5">
        <Text className="font-roboto text-[11px] tracking-[1.6px] text-tinta/55">CANCELAR</Text>
      </Pressable>
    </View>
  );
}

export function BarraListaAdmin({
  onAgregar,
  seleccion,
  onEliminar,
}: {
  onAgregar: () => void;
  seleccion: { activa: boolean; cuenta: number; activar: () => void; vaciar: () => void };
  onEliminar: () => void;
}) {
  return (
    <View className="flex-row flex-wrap items-center">
      {seleccion.activa ? null : (
        <View className="mr-2">
          <BotonAgregarAdmin onPress={onAgregar} />
        </View>
      )}
      <BarraSeleccionAdmin
        activa={seleccion.activa}
        cuenta={seleccion.cuenta}
        onActivar={seleccion.activar}
        onCancelar={seleccion.vaciar}
        onEliminar={onEliminar}
      />
    </View>
  );
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
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCerrar}>
      <EvitarTeclado offset={0}>
        <View className="flex-1 justify-end bg-marca-oscura/55">
          <View className="max-h-[88%] overflow-hidden">
            <Pergamino>
              <View className="px-6 pb-10 pt-3">
                <View className="mb-5 h-px w-10 self-center bg-madera/40" />
                <View className="mb-6 flex-row items-end justify-between">
                  <Text className="flex-1 font-serif-light text-[26px] text-tinta">{titulo}</Text>
                  <Pressable onPress={onCerrar} hitSlop={8} className="pb-1">
                    <IconoNav name="close" size={18} className="text-texto/40" />
                  </Pressable>
                </View>
                <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
                  {children}
                </ScrollView>
              </View>
            </Pergamino>
          </View>
        </View>
      </EvitarTeclado>
    </Modal>
  );
}

export function ComandaAdmin({ children }: { children: ReactNode }) {
  return (
    <Pergamino>
      <View className="px-5 py-5">{children}</View>
    </Pergamino>
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
    <View
      className="rounded-[22px] bg-white px-5 py-6"
      style={{
        shadowColor: '#3a0c20',
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
      }}>
      <Text className="font-serif-light text-2xl text-tinta">{titulo}</Text>
      <Text className="mt-2 font-roboto text-sm leading-5 text-tinta/50">{texto}</Text>
    </View>
  );
}
