import { Pressable, ScrollView, Text, View } from 'react-native';

import Button from '@/components/Button';
import { Footer } from '@/shared/components/footer';
import { LoginModal } from '@/shared/components/nav-bar/LoginModal';

import { useInvitado } from '../hooks/useInvitado';

export function InvitadoPerfil() {
  const invitado = useInvitado();

  return (
    <View className="flex-1 bg-marca-oscura">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-6 pb-12 pt-8">
          <Text className="font-roboto text-[10px] tracking-[4px] text-oro">MI CUENTA</Text>
          <View className="mt-2 h-px w-10 bg-oro" />

          <View className="mt-6 overflow-hidden rounded-[32px] bg-marca px-6 py-9">
            <Text className="text-center font-serif-light text-[34px] leading-[38px] text-crema">
              Inicia sesión
            </Text>
            <Text className="mt-3 text-center font-roboto text-[15px] leading-6 text-crema/70">
              Pedidos, reservas y tus datos, en un solo folio.
            </Text>
          </View>

          <View className="mt-8 gap-3">
            <Button text="INICIAR SESIÓN" variant="gold" onPress={invitado.abrirLogin} />
            <Button text="CREAR CUENTA" variant="ghost" onPress={invitado.irARegistro} />
          </View>

          <Pressable onPress={invitado.irAlInicio} className="mt-8 py-3">
            <Text className="text-center font-roboto text-sm text-oro">Volver al inicio</Text>
          </Pressable>
        </View>
        <Footer />
      </ScrollView>
      <LoginModal visible={invitado.loginAbierto} onClose={invitado.cerrarLogin} />
    </View>
  );
}
