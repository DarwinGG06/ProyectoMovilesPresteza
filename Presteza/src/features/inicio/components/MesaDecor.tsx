import { Image, Text, View } from 'react-native';

type PlatoProps = {
  uri: string;
  size: number;
  borde?: string;
};

export function Plato({ uri, size, borde = '#d4af77' }: PlatoProps) {
  const hueco = size - 12;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1.5,
        borderColor: borde,
        backgroundColor: '#2a0818',
        padding: 4,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <View
        style={{
          width: hueco,
          height: hueco,
          borderRadius: hueco / 2,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: `${borde}55`,
        }}>
        <Image source={{ uri }} style={{ width: hueco, height: hueco }} resizeMode="cover" />
      </View>
    </View>
  );
}

export function PuntosTicket() {
  return (
    <View className="flex-row justify-between px-1">
      {Array.from({ length: 18 }).map((_, index) => (
        <View key={index} className="h-1.5 w-1.5 rounded-full bg-marca-oscura/25" />
      ))}
    </View>
  );
}

export function MarcaCurso({ numero, nombre }: { numero: string; nombre: string }) {
  return (
    <View className="mb-6 flex-row items-center">
      <View className="h-8 w-8 items-center justify-center rounded-full border border-oro">
        <Text className="font-roboto text-[10px] text-oro">{numero}</Text>
      </View>
      <View className="ml-3 h-px flex-1 bg-oro/35" />
      <Text className="ml-3 font-roboto text-[11px] tracking-[3px] text-oro">{nombre}</Text>
    </View>
  );
}
