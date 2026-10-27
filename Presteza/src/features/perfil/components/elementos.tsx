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

export function BotonAgregar({
  etiqueta,
  onPress,
  sobrePapel,
}: {
  etiqueta: string;
  onPress: () => void;
  sobrePapel?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      className={`min-h-12 flex-row items-center self-start rounded-full pl-1.5 pr-5 ${
        sobrePapel ? 'bg-marca' : 'bg-crema'
      }`}>
      <View
        className={`mr-3 h-10 w-10 items-center justify-center rounded-full ${
          sobrePapel ? 'bg-crema/15' : 'bg-marca'
        }`}>
        <IconoNav name="add" size={22} className="text-crema" />
      </View>
      <Text
        className={`font-roboto text-[12px] tracking-[1.2px] ${
          sobrePapel ? 'text-crema' : 'text-marca'
        }`}>
        {etiqueta}
      </Text>
    </Pressable>
  );
}

export function BotonPerfil({
  etiqueta,
  onPress,
  variante = 'primario',
  disabled,
}: BotonPerfilProps) {
  const caja =
    variante === 'peligro'
      ? 'border border-red-600/35'
      : variante === 'outline'
        ? 'border border-marca/20'
        : 'bg-marca';
  const letra =
    variante === 'peligro' ? 'text-red-700' : variante === 'outline' ? 'text-marca' : 'text-crema';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      className={`min-h-12 items-center justify-center rounded-full px-5 ${caja} ${
        disabled ? 'opacity-45' : 'active:opacity-80'
      }`}>
      <Text className={`text-center font-roboto text-[12px] tracking-[1.2px] ${letra}`}>
        {etiqueta}
      </Text>
    </Pressable>
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
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="min-h-12 justify-center py-1 pr-4">
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
