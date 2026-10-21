import { Pressable, Text, View } from 'react-native';

type SelectorCapacidadProps = {
  valor: number;
  onCambiar: (valor: number) => void;
  detalle?: string;
};

export function SelectorCapacidad({ valor, onCambiar, detalle }: SelectorCapacidadProps) {
  return (
    <View className="mt-6 border-y border-madera/15 py-5">
      <Text className="font-roboto text-[10px] tracking-[3px] text-marca">NÚMERO DE PERSONAS</Text>
      <Text className="mt-1 font-serif-light text-2xl text-tinta">¿Cuántos vienen?</Text>

      <View className="mt-5 flex-row items-center justify-between">
        <Pressable
          onPress={() => onCambiar(Math.max(1, valor - 1))}
          className="h-10 w-10 items-center justify-center border border-madera/30">
          <Text className="font-roboto text-xl text-tinta">−</Text>
        </Pressable>

        <Text className="font-serif-light text-4xl text-tinta">{valor}</Text>

        <Pressable
          onPress={() => onCambiar(Math.min(20, valor + 1))}
          className="h-10 w-10 items-center justify-center border border-madera/30">
          <Text className="font-roboto text-xl text-tinta">+</Text>
        </Pressable>
      </View>

      <Text className="mt-3 text-center font-roboto text-sm text-tinta/50">
        {valor} {valor === 1 ? 'persona' : 'personas'}
        {detalle ? ` · ${detalle}` : ''}
      </Text>
    </View>
  );
}
