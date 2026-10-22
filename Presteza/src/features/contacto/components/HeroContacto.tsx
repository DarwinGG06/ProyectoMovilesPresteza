import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated from 'react-native-reanimated';

import { HERO_CONTACTO } from '../data';
import { useEntradaHeroContacto } from '../hooks/useEntradaHeroContacto';

export function HeroContacto() {
  const entrada = useEntradaHeroContacto();

  return (
    <ImageBackground source={{ uri: HERO_CONTACTO }} style={estilos.alto} imageStyle={estilos.foto}>
      <LinearGradient
        colors={['rgba(107,29,61,0.55)', 'rgba(58,12,32,0.94)']}
        style={StyleSheet.absoluteFill}
      />
      <View className="flex-1 justify-end px-6 pb-10 pt-16">
        <Animated.View style={entrada}>
          <Text className="font-roboto text-[10px] tracking-[4px] text-oro">
            PRESTEZA · MILÁN · MANIZALES
          </Text>
          <Text className="mt-3 font-serif-light text-[42px] leading-[46px] text-crema">
            Hablemos.
          </Text>
          <View className="mt-4 h-px w-14 bg-oro" />
          <Text className="mt-4 max-w-[260px] font-serif-italic text-[17px] leading-6 text-crema/70">
            Una duda, un evento o un comentario. Te respondemos desde la casa.
          </Text>
        </Animated.View>
      </View>
    </ImageBackground>
  );
}

const estilos = StyleSheet.create({
  alto: { height: 420 },
  foto: { resizeMode: 'cover' },
});
