import { Pressable, Text, View } from 'react-native';

import { IconoNav } from '@/shared/components/nav-bar/IconoNav';

type SelectorCapacidadProps = {
  valor: number;
  onCambiar: (valor: number) => void;
  detalle?: string;
};

export function SelectorCapacidad({ valor, onCambiar, detalle }: SelectorCapacidadProps) {
  const porcentaje = ((valor - 1) / 19) * 100;

  return (
    <View className="mt-5 rounded-[20px] border-2 border-[#ffc107]/40 bg-[#ffc107]/15 px-4 py-5">
      <View className="mb-4 flex-row items-center justify-center gap-2">
        <IconoNav name="people" size={22} className="text-marca" />
        <Text className="font-roboto-bold text-[13px] uppercase tracking-[1px] text-marca">
          Número de personas
        </Text>
      </View>

      <View className="flex-row items-center justify-between gap-3">
        <Pressable
          onPress={() => onCambiar(Math.max(1, valor - 1))}
          className="h-11 w-11 items-center justify-center rounded-full bg-marca">
          <Text className="font-roboto text-2xl leading-6 text-white">−</Text>
        </Pressable>

        <View className="min-w-[72px] items-center rounded-xl bg-[#ffc107] px-4 py-2">
          <Text className="font-roboto-extrabold text-3xl text-marca">{valor}</Text>
        </View>

        <Pressable
          onPress={() => onCambiar(Math.min(20, valor + 1))}
          className="h-11 w-11 items-center justify-center rounded-full bg-marca">
          <Text className="font-roboto text-2xl leading-6 text-white">+</Text>
        </Pressable>
      </View>

      <View className="mt-4 h-3 overflow-hidden rounded-full bg-marca/20">
        <View className="h-full rounded-full bg-marca" style={{ width: `${porcentaje}%` }} />
      </View>
      <View className="mt-2 flex-row justify-between">
        <Text className="font-roboto-semibold text-xs text-marca">1</Text>
        <Text className="font-roboto-semibold text-xs text-marca">20</Text>
      </View>

      <View className="mt-4 items-center">
        <View className="flex-row items-center gap-2 rounded-2xl bg-marca px-5 py-3">
          <IconoNav name="person" size={18} className="text-white" />
          <Text className="font-roboto-bold text-sm text-white">
            {valor} {valor === 1 ? 'persona' : 'personas'}
          </Text>
        </View>
        {detalle ? (
          <Text className="mt-3 text-center font-roboto-semibold text-xs text-marca">
            {detalle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
