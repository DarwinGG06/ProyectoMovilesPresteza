import { Text, View } from 'react-native';

type SelloPProps = {
  size?: 'sm' | 'md' | 'lg';
};

const MEDIDAS = {
  sm: { caja: 'h-10 w-10', anillo: 'h-8 w-8', letra: 'text-base' },
  md: { caja: 'h-14 w-14', anillo: 'h-11 w-11', letra: 'text-xl' },
  lg: { caja: 'h-24 w-24', anillo: 'h-[76px] w-[76px]', letra: 'text-4xl' },
};

export function SelloP({ size = 'sm' }: SelloPProps) {
  const m = MEDIDAS[size];

  return (
    <View className={`${m.caja} items-center justify-center rounded-full bg-oro`}>
      <View className={`${m.anillo} items-center justify-center rounded-full bg-marca-oscura`}>
        <Text className={`${m.letra} font-extrabold text-oro`}>P</Text>
      </View>
    </View>
  );
}
