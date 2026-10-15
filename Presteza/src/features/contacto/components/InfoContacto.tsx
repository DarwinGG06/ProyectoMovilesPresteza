import { Pressable, Text, View } from 'react-native';

import { Icono } from '@/shared/components/footer/Icono';
import { IconoNav } from '@/shared/components/nav-bar/IconoNav';

import type { useContacto } from '../hooks/useContacto';

type InfoContactoProps = Pick<
  ReturnType<typeof useContacto>,
  'contacto' | 'whatsapp' | 'llamar' | 'escribirCorreo' | 'abrirMapa' | 'abrirWhatsapp'
>;

function FilaDato({
  etiqueta,
  valor,
  onPress,
}: {
  etiqueta: string;
  valor: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="flex-row items-baseline py-4">
      <Text className="w-[92px] font-roboto text-[10px] tracking-[2px] text-oro">{etiqueta}</Text>
      <View className="mx-2 mb-1 h-px flex-1 bg-oro/35" />
      <Text className="max-w-[58%] text-right font-roboto-light text-[16px] text-crema">
        {valor}
      </Text>
    </Pressable>
  );
}

export function InfoContacto({
  contacto,
  whatsapp,
  llamar,
  escribirCorreo,
  abrirMapa,
  abrirWhatsapp,
}: InfoContactoProps) {
  const telefono = contacto.telefono.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');

  return (
    <View className="bg-marca-oscura">
      <View className="px-6 pb-4 pt-10">
        <Text className="font-roboto text-[10px] tracking-[4px] text-oro">LA CASA</Text>
        <Text className="mt-2 font-roboto-light text-3xl text-crema">Cómo encontrarnos</Text>
        <Text className="mt-2 font-roboto text-sm leading-5 text-crema/55">
          Torre Plaza 70, Milán. Una llamada, un correo o la mesa.
        </Text>

        <View className="mt-6 border-y border-oro/20">
          <FilaDato etiqueta="TELÉFONO" valor={telefono} onPress={llamar} />
          <View className="h-px bg-oro/15" />
          <FilaDato etiqueta="CORREO" valor={contacto.email} onPress={escribirCorreo} />
          <View className="h-px bg-oro/15" />
          <Pressable onPress={abrirMapa} className="py-4">
            <View className="flex-row items-baseline">
              <Text className="w-[92px] font-roboto text-[10px] tracking-[2px] text-oro">
                DIRECCIÓN
              </Text>
              <View className="mx-2 mb-1 h-px flex-1 bg-oro/35" />
              <Text className="font-roboto text-[10px] tracking-[2px] text-oro">MAPA →</Text>
            </View>
            <Text className="mt-3 font-roboto-light text-[16px] leading-6 text-crema">
              {contacto.direccion}
            </Text>
          </Pressable>
        </View>
      </View>

      <View className="px-6 pb-8 pt-6">
        <Text className="mb-5 font-roboto text-[10px] tracking-[4px] text-oro">HORARIOS</Text>
        <View className="flex-row gap-3">
          <View className="flex-1 border border-oro/25 px-4 py-5">
            <Text className="font-roboto text-[10px] tracking-[2px] text-oro">01 · SEMANA</Text>
            <Text className="mt-3 font-roboto-light text-3xl text-oro">11–22</Text>
            <Text className="mt-2 font-roboto text-sm text-crema/70">Lunes a viernes</Text>
          </View>
          <View className="flex-1 border border-oro/25 px-4 py-5">
            <Text className="font-roboto text-[10px] tracking-[2px] text-oro">02 · FINDE</Text>
            <Text className="mt-3 font-roboto-light text-3xl text-oro">12–23</Text>
            <Text className="mt-2 font-roboto text-sm text-crema/70">Sábado y domingo</Text>
          </View>
        </View>
      </View>

      <View className="px-6 pb-12">
        <Pressable
          onPress={abrirWhatsapp}
          className="flex-row items-center border border-oro/30 px-4 py-4 active:bg-white/5">
          <View className="h-11 w-11 items-center justify-center bg-whatsapp">
            <Icono name="whatsapp" size={20} className="text-white" />
          </View>
          <View className="ml-4 flex-1">
            <Text className="font-roboto text-[10px] tracking-[2px] text-oro">WHATSAPP</Text>
            <Text className="mt-1 font-roboto-light text-lg text-crema">{whatsapp.nombre}</Text>
            <Text className="font-roboto text-sm text-crema/60">{telefono}</Text>
          </View>
          <IconoNav name="arrow-forward" size={16} className="text-oro" />
        </Pressable>
      </View>
    </View>
  );
}
