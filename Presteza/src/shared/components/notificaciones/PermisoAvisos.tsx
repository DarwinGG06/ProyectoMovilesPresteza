import { Modal, Pressable, Text, View } from 'react-native';

import { IconoNav } from '@/shared/components/nav-bar/IconoNav';
import { colores } from '@/theme/tokens';

type Props = {
  visible: boolean;
  onActivar: () => void;
  onOmitir: () => void;
};

/** Modal previo al permiso nativo de avisos (APK / dev build). */
export function PermisoAvisos({ visible, onActivar, onOmitir }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onOmitir}>
      <View className="flex-1 items-center justify-center bg-black/55 px-6">
        <View className="w-full max-w-md overflow-hidden border border-oro bg-pergamino">
          <View className="h-1 w-full bg-oro" />
          <View className="items-center px-6 pb-6 pt-7">
            <View className="mb-4 h-14 w-14 items-center justify-center border border-oro bg-marca-oscura">
              <IconoNav name="notifications-outline" size={26} color={colores.oro} />
            </View>
            <Text className="font-roboto text-[12px] tracking-[3px] text-marca">PRESTEZA · AVISOS</Text>
            <Text className="mt-2 text-center font-serif text-[26px] leading-8 text-tinta">
              ¿Te avisamos del pedido?
            </Text>
            <Text className="mt-3 text-center font-roboto text-[14px] leading-5 text-madera">
              Activa las notificaciones para saber cuando tu mesa esté lista, el domicilio en camino o
              tu beneficio de cumpleaños.
            </Text>
            <Pressable
              onPress={onActivar}
              accessibilityRole="button"
              accessibilityLabel="Activar avisos"
              className="mt-6 min-h-12 w-full items-center justify-center bg-marca-oscura px-4">
              <Text className="font-roboto text-[13px] tracking-[2px] text-oro">ACTIVAR AVISOS</Text>
            </Pressable>
            <Pressable
              onPress={onOmitir}
              accessibilityRole="button"
              accessibilityLabel="Ahora no"
              className="mt-3 min-h-12 w-full items-center justify-center px-4">
              <Text className="font-roboto text-[13px] text-madera">Ahora no</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
