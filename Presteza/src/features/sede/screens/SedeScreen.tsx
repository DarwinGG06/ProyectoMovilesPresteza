import { ImageBackground, Pressable, ScrollView, Text, View } from 'react-native';

import { MarcaCurso } from '@/features/inicio/components/MesaDecor';
import { Footer } from '@/shared/components/footer';
import { IconoNav } from '@/shared/components/nav-bar/IconoNav';

import { FormularioSede } from '../components/FormularioSede';
import { MapaSede } from '../components/MapaSede';
import { useSede } from '../hooks/useSede';

export function SedeScreen() {
  const { sede, instalaciones, abrirMapa } = useSede();

  return (
    <View className="flex-1 bg-marca-oscura">
      <ScrollView showsVerticalScrollIndicator={false}>
        <ImageBackground source={{ uri: sede.foto }} style={{ height: 360 }} resizeMode="cover">
          <View className="flex-1 justify-end bg-marca-oscura/70 px-5 pb-8 pt-10">
            <Text className="text-[10px] tracking-[3px] text-oro">SEDE · MILÁN · MANIZALES</Text>
            <Text className="mt-2 text-[38px] font-light leading-[42px] text-crema">Estamos en Milán.</Text>
            <View className="mt-3 h-px w-16 bg-oro" />
            <Text className="mt-3 text-base text-crema/80">Torre Plaza 70, piso 2 · Local 8</Text>
            <Pressable onPress={abrirMapa} className="mt-6 self-start bg-oro px-5 py-3">
              <Text className="text-[11px] tracking-[2px] text-marca-oscura">VER MAPA</Text>
            </Pressable>
          </View>
        </ImageBackground>

        <View className="px-5 pt-10 pb-8">
          <MarcaCurso numero="I" nombre="UBICACIÓN" />
          <View className="border border-oro/20 bg-crema px-5 py-6">
            <Text className="text-[10px] tracking-[3px] text-marca">SEDE PRINCIPAL</Text>
            <Text className="mt-2 text-2xl font-light text-marca-oscura">{sede.direccion}</Text>
            <Text className="mt-3 text-[15px] leading-6 text-texto/70">{sede.direccionCompleta}</Text>
            <Text className="mt-3 text-sm text-marca">{sede.ciudad}</Text>
          </View>
        </View>

        <View className="px-5 pb-8">
          <MarcaCurso numero="II" nombre="HORARIOS" />
          <View className="flex-row gap-3">
            <View className="flex-1 border border-oro/25 px-4 py-5">
              <Text className="text-[10px] tracking-[2px] text-oro">01 · SEMANA</Text>
              <Text className="mt-3 text-3xl font-light text-oro">11–22</Text>
              <Text className="mt-2 text-sm text-crema/80">Lunes a viernes</Text>
            </View>
            <View className="flex-1 border border-oro/25 px-4 py-5">
              <Text className="text-[10px] tracking-[2px] text-oro">02 · FINDE</Text>
              <Text className="mt-3 text-3xl font-light text-oro">12–23</Text>
              <Text className="mt-2 text-sm text-crema/80">Sábado y domingo</Text>
            </View>
          </View>
        </View>

        <View className="px-5 pb-8">
          <MarcaCurso numero="III" nombre="CÓMO LLEGAR" />
          <View className="overflow-hidden border border-oro/30">
            <MapaSede alto={260} />
          </View>
          <Pressable onPress={abrirMapa} className="mt-4 border border-oro py-4">
            <Text className="text-center text-[11px] tracking-[2px] text-oro">ABRIR EN GOOGLE MAPS</Text>
          </Pressable>
        </View>

        <View className="px-5 pb-8">
          <MarcaCurso numero="IV" nombre="INSTALACIONES" />
          <View className="flex-row gap-3">
            {instalaciones.map((item) => (
              <View key={item.titulo} className="flex-1 items-center border border-oro/25 px-2 py-5">
                <IconoNav name={item.icono} size={28} className="text-oro" />
                <Text className="mt-3 text-center text-sm font-light text-crema">{item.titulo}</Text>
              </View>
            ))}
          </View>
        </View>

        <FormularioSede />
        <Footer />
      </ScrollView>
    </View>
  );
}
