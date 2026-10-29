import { Image, ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { MarcaCurso } from '@/features/inicio/components/MesaDecor';
import { EvitarTeclado } from '@/shared/components/evitar-teclado/EvitarTeclado';
import { Footer } from '@/shared/components/footer';
import { Pergamino } from '@/shared/components/materiales/Pergamino';
import { IconoNav } from '@/shared/components/nav-bar/IconoNav';

import { FUNDADORES, HERO_NOSOTROS, HISTORIA, MISION, VALORES_CASA, VISION } from '../data';

export function NosotrosScreen() {
  return (
    <EvitarTeclado>
      <View className="flex-1 bg-marca-oscura">
        <ScrollView showsVerticalScrollIndicator={false}>
          <ImageBackground
            source={{ uri: HERO_NOSOTROS }}
            style={estilos.hero}
            imageStyle={estilos.foto}>
            <LinearGradient
              colors={['rgba(107,29,61,0.5)', 'rgba(58,12,32,0.94)']}
              style={StyleSheet.absoluteFill}
            />
            <View className="flex-1 justify-end px-6 pb-10 pt-16">
              <Text className="font-roboto text-[10px] tracking-[4px] text-oro">
                PRESTEZA · LA CASA
              </Text>
              <Text className="mt-3 font-serif-light text-[42px] leading-[46px] text-crema">
                Sobre nosotros
              </Text>
              <View className="mt-4 h-px w-14 bg-oro" />
              <Text className="mt-4 max-w-[280px] font-serif-italic text-[17px] leading-6 text-crema/70">
                Historia, oficio y la mesa que armamos desde 2020.
              </Text>
            </View>
          </ImageBackground>

          <View className="px-5 pb-8 pt-10">
            <MarcaCurso numero="I" nombre="HISTORIA" />
            <Pergamino>
              <View className="overflow-hidden">
                <Image source={{ uri: HISTORIA.foto }} className="h-52 w-full" resizeMode="cover" />
                <View className="px-5 py-6">
                  <Text className="font-roboto text-[10px] tracking-[3px] text-marca">
                    {HISTORIA.year}
                  </Text>
                  <Text className="mt-2 font-serif-light text-[28px] leading-8 text-tinta">
                    {HISTORIA.titulo}
                  </Text>
                  <Text className="mt-4 font-roboto text-[15px] leading-6 text-tinta/70">
                    {HISTORIA.texto}
                  </Text>
                  <View className="mt-5 h-px w-10 bg-marca/30" />
                  <Text className="mt-4 font-serif-italic text-[16px] leading-6 text-tinta/70">
                    {HISTORIA.hito}
                  </Text>
                </View>
              </View>
            </Pergamino>
          </View>

          <View className="px-5 pb-8">
            <MarcaCurso numero="II" nombre="VALORES" />
            <View className="flex-row flex-wrap justify-between">
              {VALORES_CASA.map((valor) => (
                <View key={valor.titulo} className="mb-3 w-[48%] border border-oro/25 px-4 py-5">
                  <IconoNav name={valor.icono} size={22} className="text-oro" />
                  <Text className="mt-4 font-serif-light text-[22px] text-crema">
                    {valor.titulo}
                  </Text>
                  <Text className="mt-2 font-roboto text-[13px] leading-5 text-crema/70">
                    {valor.texto}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className="px-5 pb-8">
            <MarcaCurso numero="III" nombre="FUNDADORES" />
            <View className="flex-row gap-3">
              {FUNDADORES.map((persona) => (
                <View key={persona.nombre} className="flex-1 overflow-hidden border border-oro/25">
                  <Image
                    source={{ uri: persona.foto }}
                    className="h-44 w-full bg-marca"
                    resizeMode="cover"
                  />
                  <View className="px-4 py-4">
                    <Text className="font-serif-light text-[24px] text-crema">
                      {persona.nombre}
                    </Text>
                    <Text className="mt-1 font-roboto text-[11px] tracking-[1.4px] text-oro">
                      {persona.rol.toUpperCase()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View className="px-5 pb-8">
            <MarcaCurso numero="IV" nombre="CASA" />
            <Pergamino>
              <View className="px-5 py-6">
                <Text className="font-roboto text-[10px] tracking-[3px] text-marca">MISIÓN</Text>
                <Text className="mt-3 font-roboto text-[15px] leading-6 text-tinta/70">
                  {MISION}
                </Text>
                <View className="my-6 h-px bg-madera/20" />
                <Text className="font-roboto text-[10px] tracking-[3px] text-marca">VISIÓN</Text>
                <Text className="mt-3 font-roboto text-[15px] leading-6 text-tinta/70">
                  {VISION}
                </Text>
              </View>
            </Pergamino>
          </View>

          <Footer />
        </ScrollView>
      </View>
    </EvitarTeclado>
  );
}

const estilos = StyleSheet.create({
  hero: { height: 420 },
  foto: { resizeMode: 'cover' },
});
