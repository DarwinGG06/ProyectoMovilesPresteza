import { Text, View } from 'react-native';

type EncabezadoSeccionProps = {
  badge: string;
  titulo: string;
  subtitulo: string;
  claro?: boolean;
};

export function EncabezadoSeccion({ badge, titulo, subtitulo, claro = false }: EncabezadoSeccionProps) {
  return (
    <View className="mb-7">
      <Text className={`text-[10px] tracking-[4px] ${claro ? 'text-oro' : 'text-marca'}`}>{badge}</Text>
      <Text className={`mt-1 text-3xl font-light ${claro ? 'text-crema' : 'text-marca-oscura'}`}>{titulo}</Text>
      <Text className={`mt-2 text-sm leading-5 ${claro ? 'text-crema/60' : 'text-texto/55'}`}>{subtitulo}</Text>
    </View>
  );
}
