import { type ComponentProps, type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { MarcaCurso } from '@/features/inicio/components/MesaDecor';
import { IconoNav } from '@/shared/components/nav-bar/IconoNav';

type NombreIcono = ComponentProps<typeof IconoNav>['name'];

type TarjetaPerfilProps = {
  numero: string;
  badge: string;
  titulo: string;
  accion?: { etiqueta: string; onPress: () => void };
  children: ReactNode;
};

export function TarjetaPerfil({ numero, badge, titulo, accion, children }: TarjetaPerfilProps) {
  return (
    <View className="mb-10">
      <MarcaCurso numero={numero} nombre={badge} />
      <View className="mb-5 flex-row items-end justify-between gap-3">
        <Text className="flex-1 text-3xl font-light text-white">{titulo}</Text>
        {accion ? (
          <Pressable onPress={accion.onPress} className="pb-1">
            <Text className="text-[11px] tracking-[2px] text-oro">{accion.etiqueta} →</Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

type EstadoVacioProps = {
  icono: NombreIcono;
  titulo: string;
  texto: string;
  accion?: { etiqueta: string; onPress: () => void };
};

export function EstadoVacio({ icono, titulo, texto, accion }: EstadoVacioProps) {
  return (
    <View className="py-2">
      <View className="mb-4 h-px w-12 bg-oro" />
      <IconoNav name={icono} size={22} className="text-oro" />
      <Text className="mt-3 text-2xl font-light text-crema">{titulo}</Text>
      <Text className="mt-2 text-sm leading-5 text-crema/55">{texto}</Text>
      {accion ? (
        <Pressable onPress={accion.onPress} className="mt-5 self-start">
          <Text className="text-[11px] tracking-[2px] text-oro">{accion.etiqueta} →</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Mensaje({ texto, error }: { texto: string; error?: boolean }) {
  return <Text className={`mb-3 text-sm ${error ? 'text-red-300' : 'text-oro'}`}>{texto}</Text>;
}

