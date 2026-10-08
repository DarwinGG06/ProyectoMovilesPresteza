import { type ComponentProps, type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import Button from '@/components/Button';
import { PuntosTicket } from '@/features/inicio/components/MesaDecor';
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
  const clases =
    variante === 'primario'
      ? 'bg-marca-oscura'
      : variante === 'peligro'
        ? 'border border-red-400/50'
        : 'border border-oro';
  const texto =
    variante === 'outline' ? 'text-oro' : variante === 'peligro' ? 'text-red-300' : 'text-crema';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`px-4 py-3 ${clases} ${disabled ? 'opacity-50' : ''}`}>
      <Text className={`text-center font-roboto text-[11px] tracking-[2px] ${texto}`}>
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
      <Text className="w-[92px] font-roboto text-[10px] tracking-[2px] text-crema">{etiqueta}</Text>
      <View className="mx-2 mb-1 h-px flex-1 bg-oro" />
      <Text className="max-w-[58%] text-right font-roboto-light text-[17px] text-white">
        {valor}
      </Text>
    </View>
  );
}

export function GrillaDatos({ children }: { children: ReactNode }) {
  return <View className="border-y border-oro/20">{children}</View>;
}

export function LineaCuenta({
  indice,
  titulo,
  sello,
  children,
}: {
  indice: number;
  titulo: string;
  sello?: string;
  children: ReactNode;
}) {
  const numero = String(indice + 1).padStart(2, '0');

  return (
    <View className="border-b border-oro/20 py-5">
      <View className="flex-row items-start gap-3">
        <Text className="mt-1 w-7 font-roboto text-[10px] text-oro">{numero}</Text>
        <View className="flex-1">
          <View className="flex-row items-baseline justify-between gap-3">
            <Text className="flex-1 font-roboto-light text-xl text-crema">{titulo}</Text>
            {sello ? (
              <Text className="font-roboto text-[10px] tracking-[2px] text-oro">{sello}</Text>
            ) : null}
          </View>
          {children}
        </View>
      </View>
    </View>
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
        className={`font-roboto text-[11px] tracking-[2px] ${peligro ? 'text-red-300' : 'text-oro'}`}>
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
    <View className="bg-crema px-5 py-5">
      <PuntosTicket />
      <View className="my-5">{children}</View>
      <PuntosTicket />
    </View>
  );
}
