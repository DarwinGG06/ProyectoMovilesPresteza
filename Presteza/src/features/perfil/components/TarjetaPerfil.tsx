import { type ComponentProps, type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import Button from '@/components/Button';
import { IconoNav } from '@/shared/components/nav-bar/IconoNav';

import { TarjetaFolio } from './elementos';

type NombreIcono = ComponentProps<typeof IconoNav>['name'];

type TarjetaPerfilProps = {
  numero: string;
  badge: string;
  titulo: string;
  accion?: { etiqueta: string; onPress: () => void };
  compacto?: boolean;
  children: ReactNode;
};

export function TarjetaPerfil({ titulo, accion, compacto, children }: TarjetaPerfilProps) {
  if (compacto) {
    return (
      <View className="mb-2">
        {accion ? (
          <Button text={accion.etiqueta} variant="gold" className="mb-4" onPress={accion.onPress} />
        ) : null}
        {children}
      </View>
    );
  }

  return (
    <View className="mb-6">
      <View className="mb-3 flex-row items-end justify-between gap-3">
        <Text className="min-w-0 flex-1 font-serif-light text-[28px] text-crema">{titulo}</Text>
        {accion ? (
          <Pressable onPress={accion.onPress} className="pb-1">
            <Text className="font-roboto text-[11px] tracking-[2px] text-oro">{accion.etiqueta}</Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

type EstadoVacioProps = {
  icono: NombreIcono;
  titulo?: string;
  texto: string;
  accion?: { etiqueta: string; onPress: () => void };
};

export function EstadoVacio({ titulo, texto, accion }: EstadoVacioProps) {
  return (
    <TarjetaFolio>
      {titulo ? <Text className="mb-2 font-serif-light text-2xl text-tinta">{titulo}</Text> : null}
      <Text className="font-roboto text-sm leading-5 text-tinta/50">{texto}</Text>
      {accion ? (
        <Pressable onPress={accion.onPress} className="mt-5 self-start">
          <Text className="font-roboto text-[11px] tracking-[2px] text-marca">{accion.etiqueta}</Text>
        </Pressable>
      ) : null}
    </TarjetaFolio>
  );
}

export function Mensaje({ texto, error }: { texto: string; error?: boolean }) {
  return (
    <Text className={`mb-3 font-roboto text-sm ${error ? 'text-red-400' : 'text-oro'}`}>{texto}</Text>
  );
}
