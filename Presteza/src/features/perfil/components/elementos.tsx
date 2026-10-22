import { type ComponentProps, type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import Button from '@/components/Button';
import { Pergamino } from '@/shared/components/materiales/Pergamino';
import { IconoNav } from '@/shared/components/nav-bar/IconoNav';

type NombreIcono = ComponentProps<typeof IconoNav>['name'];

type BotonPerfilProps = {
  etiqueta: string;
  onPress: () => void;
  variante?: 'primario' | 'outline' | 'peligro';
  disabled?: boolean;
};

export function BotonPerfil({
  etiqueta,
  onPress,
  variante = 'primario',
  disabled,
}: BotonPerfilProps) {
  if (variante === 'peligro') {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        className={`border border-red-600/40 px-4 py-3 ${disabled ? 'opacity-50' : ''}`}>
        <Text className="text-center font-roboto text-[11px] tracking-[2px] text-red-700">
          {etiqueta}
        </Text>
      </Pressable>
    );
  }

  return (
    <Button
      text={etiqueta}
      onPress={onPress}
      disabled={disabled}
      variant={variante === 'outline' ? 'gold' : 'primary'}
    />
  );
}

export function FilaDato({
  etiqueta,
  valor,
}: {
  icono?: NombreIcono;
  etiqueta: string;
  valor: string;
}) {
  return (
    <View className="flex-row items-baseline py-3.5">
      <Text className="w-[92px] font-roboto text-[10px] tracking-[2px] text-marca">{etiqueta}</Text>
      <View className="mx-2 mb-1 h-px flex-1 bg-madera/20" />
      <Text className="max-w-[58%] text-right font-roboto text-[16px] text-tinta">{valor}</Text>
    </View>
  );
}

export function GrillaDatos({ children }: { children: ReactNode }) {
  return <View className="border-y border-oro/20">{children}</View>;
}

export function TarjetaFolio({ children }: { children: ReactNode }) {
  return (
    <View className="mb-3 overflow-hidden rounded-[28px]">
      <Pergamino>
        <View className="px-5 py-5">{children}</View>
      </Pergamino>
    </View>
  );
}

export function LineaCuenta({
  titulo,
  sello,
  children,
}: {
  indice?: number;
  titulo: string;
  sello?: string;
  children: ReactNode;
}) {
  return (
    <TarjetaFolio>
      <View className="flex-row items-baseline justify-between gap-3">
        <Text className="flex-1 font-serif text-xl text-tinta">{titulo}</Text>
        {sello ? (
          <Text className="font-roboto text-[10px] tracking-[2px] text-marca">{sello}</Text>
        ) : null}
      </View>
      {children}
    </TarjetaFolio>
  );
}

export function EnlaceAccion({
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
      <Text
        className={`font-roboto text-[11px] tracking-[2px] ${peligro ? 'text-red-700' : 'text-marca'}`}>
        {etiqueta}
      </Text>
    </Pressable>
  );
}

export function AccionesFila({ children }: { children: ReactNode }) {
  return <View className="mt-3 flex-row flex-wrap items-center">{children}</View>;
}

export function AccionesFormulario({
  onCancelar,
  onGuardar,
  guardando,
  etiquetaGuardar = 'GUARDAR',
}: {
  onCancelar: () => void;
  onGuardar: () => void;
  guardando?: boolean;
  etiquetaGuardar?: string;
}) {
  return (
    <View className="mt-5 gap-2">
      <Button
        variant="gold"
        text={guardando ? 'GUARDANDO…' : etiquetaGuardar}
        onPress={onGuardar}
        disabled={guardando}
      />
      <Button text="CANCELAR" onPress={onCancelar} secondary />
    </View>
  );
}

export function Comanda({ children }: { children: ReactNode }) {
  return (
    <View className="mb-3 overflow-hidden rounded-[28px]">
      <Pergamino>
        <View className="px-5 py-5">{children}</View>
      </Pergamino>
    </View>
  );
}
