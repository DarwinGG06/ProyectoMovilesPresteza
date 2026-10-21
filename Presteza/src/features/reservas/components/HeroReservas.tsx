import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const HERO = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&q=80';

export function HeroReservas() {
  return (
    <ImageBackground
      source={{ uri: HERO }}
      className="h-[300px] justify-center"
      imageStyle={estilos.foto}>
      <LinearGradient
        colors={['rgba(107,29,61,0.72)', 'rgba(58,12,32,0.92)']}
        style={StyleSheet.absoluteFill}
      />
      <View className="items-center px-6">
        <Text className="font-roboto text-[10px] tracking-[4px] text-oro">PRESTEZA · MILÁN</Text>
        <Text className="mt-3 text-center font-serif-light text-5xl text-white">Reservas</Text>
        <View className="mt-3 h-px w-12 bg-oro/70" />
        <Text className="mt-3 text-center font-serif-italic text-base text-white/80">
          Selecciona tu mesa y reserva tu experiencia
        </Text>
      </View>
    </ImageBackground>
  );
}

const estilos = StyleSheet.create({
  foto: { resizeMode: 'cover' },
});
