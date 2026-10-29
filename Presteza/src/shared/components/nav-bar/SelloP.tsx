import { Text, View } from 'react-native';

type SelloPProps = {
  size?: 'sm' | 'md' | 'lg';
};

const MEDIDAS = {
  sm: { caja: 'h-9 w-9', letra: 'text-lg' },
  md: { caja: 'h-12 w-12', letra: 'text-2xl' },
  lg: { caja: 'h-16 w-16', letra: 'text-3xl' },
};

export function SelloP({ size = 'sm' }: SelloPProps) {
  const m = MEDIDAS[size];

  return (
    <View
      className={`${m.caja} items-center justify-center rounded-full border border-oro/70 bg-marca-oscura`}>
      <Text className={`${m.letra} font-serif text-oro`}>P</Text>
    </View>
  );
}
