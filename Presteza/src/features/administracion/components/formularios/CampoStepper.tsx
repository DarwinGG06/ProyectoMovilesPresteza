import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';

export function Paso({
  valor,
  onCambio,
  minimo = 0,
  maximo,
}: {
  valor: number;
  onCambio: (n: number) => void;
  minimo?: number;
  maximo?: number;
}) {
  return (
    <View className="flex-row items-center">
      <Pressable
        onPress={() => onCambio(Math.max(minimo, valor - 1))}
        hitSlop={8}
        className="h-9 w-9 items-center justify-center">
        <Text className="font-roboto-light text-2xl text-marca-oscura">−</Text>
      </Pressable>
      <Text className="w-8 text-center font-roboto-light text-lg text-marca-oscura">{valor}</Text>
      <Pressable
        onPress={() => onCambio(maximo != null ? Math.min(maximo, valor + 1) : valor + 1)}
        hitSlop={8}
        className="h-9 w-9 items-center justify-center">
        <Text className="font-roboto-light text-2xl text-marca-oscura">+</Text>
      </Pressable>
    </View>
  );
}

export function CampoStepper<T extends FieldValues>({
  control,
  name,
  label,
  minimo = 0,
  maximo,
}: {
  control: Control<T>;
  name: Path<T>;
  label: string;
  minimo?: number;
  maximo?: number;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange } }) => (
        <View className="flex-row items-center justify-between border-b border-marca/15 py-2">
          <Text className="font-roboto text-[10px] tracking-[2px] text-marca">{label}</Text>
          <Paso
            valor={Number(value) || 0}
            onCambio={(n) => onChange(String(n))}
            minimo={minimo}
            maximo={maximo}
          />
        </View>
      )}
    />
  );
}
