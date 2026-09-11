import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { MarcaCurso } from '@/features/inicio/components/MesaDecor';
import { Footer } from '@/shared/components/footer';
import { LoginModal } from '@/shared/components/nav-bar/LoginModal';

import { BotonPerfil } from './elementos';

export function InvitadoPerfil() {
  const [loginAbierto, setLoginAbierto] = useState(false);

  return (
    <View className="flex-1 bg-marca-oscura">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 pb-10 pt-8">
          <MarcaCurso numero="I" nombre="TU MESA" />
          <Text className="text-4xl font-light text-crema">Inicia sesión</Text>
          <Text className="mt-3 text-base leading-6 text-crema/65">
            Entra para ver tus pedidos, direcciones, reservas y datos de cuenta.
          </Text>

          <View className="mt-8 border border-oro/20 bg-crema px-5 py-6">
            <Text className="text-[10px] tracking-[3px] text-marca">CUENTA PRESTEZA</Text>
            <Text className="mt-2 text-2xl font-light text-marca-oscura">Tu mesa te espera</Text>
            <Text className="mt-2 text-sm text-texto/55">Milán, Manizales.</Text>
            <View className="mt-6 gap-2">
              <BotonPerfil etiqueta="INICIAR SESIÓN" onPress={() => setLoginAbierto(true)} />
              <BotonPerfil etiqueta="CREAR CUENTA" onPress={() => router.push('/registro')} variante="outline" />
            </View>
          </View>

          <Pressable onPress={() => router.push('/')} className="mt-6 py-3">
            <Text className="text-center text-sm text-oro">Volver al inicio</Text>
          </Pressable>
        </View>
        <Footer />
      </ScrollView>
      <LoginModal visible={loginAbierto} onClose={() => setLoginAbierto(false)} />
    </View>
  );
}
