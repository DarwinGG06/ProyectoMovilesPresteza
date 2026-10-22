import { Text, View } from 'react-native';

type Fila = {
  etiqueta: string;
  valor: string;
};

export function CuentaEscrita({ filas }: { filas: Fila[]; animar?: boolean }) {
  return (
    <View className="border-t border-madera/15">
      {filas.map((fila) => (
        <View key={fila.etiqueta} className="flex-row items-baseline border-b border-madera/15 py-3.5">
          <Text className="w-[92px] font-roboto text-[10px] tracking-[2px] text-marca">
            {fila.etiqueta}
          </Text>
          <Text className="flex-1 text-right font-roboto text-[16px] text-tinta">{fila.valor}</Text>
        </View>
      ))}
    </View>
  );
}
