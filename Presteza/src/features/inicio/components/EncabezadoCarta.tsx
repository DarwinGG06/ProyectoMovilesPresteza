import { Text, View } from 'react-native';

type EncabezadoCartaProps = {
  etiqueta: string;
  titulo: string;
};

export function EncabezadoCarta({ etiqueta, titulo }: EncabezadoCartaProps) {
  return (
    <View className="mb-8">
      <Text className="text-[11px] tracking-[4px] text-oro">{etiqueta}</Text>
      <Text className="mt-1 text-4xl font-extrabold tracking-[4px] text-crema">{titulo}</Text>
      <View className="mt-3 h-px w-24 bg-oro" />
    </View>
  );
}

export function FondoCarta() {
  return (
    <>
      <View className="absolute -right-24 top-16 h-72 w-72 rounded-full border-[40px] border-oro/10" />
      <View className="absolute -left-16 bottom-10 h-56 w-56 rounded-full bg-marca/40" />
    </>
  );
}
