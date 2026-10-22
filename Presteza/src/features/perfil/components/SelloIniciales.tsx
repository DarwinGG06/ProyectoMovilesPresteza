import { Text, View } from 'react-native';

type SelloInicialesProps = {
  letras: string;
};

export function SelloIniciales({ letras }: SelloInicialesProps) {
  return (
    <View
      style={{
        width: 88,
        height: 88,
        borderRadius: 44,
        borderWidth: 1,
        borderColor: '#d4af77',
        backgroundColor: '#2a0818',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4,
      }}>
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          borderWidth: 1,
          borderColor: 'rgba(212, 175, 119, 0.45)',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text className="font-serif text-[26px] tracking-[2px] text-oro">{letras}</Text>
      </View>
    </View>
  );
}
