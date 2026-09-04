import { router } from 'expo-router';
import { Modal, Pressable, Text, View } from 'react-native';

import { useAuth } from '@/auth/AuthContext';

import { IconoNav } from './IconoNav';
import { SelloP } from './SelloP';

type UserMenuProps = {
  visible: boolean;
  onClose: () => void;
};

export function UserMenu({ visible, onClose }: UserMenuProps) {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} className="flex-1 items-center justify-center bg-marca-oscura/70 px-6">
        <Pressable onPress={() => {}} className="w-full overflow-hidden rounded-[32px] bg-crema">
          <View className="items-center bg-marca-oscura px-6 pb-8 pt-7">
            <View className="mb-3">
              <SelloP size="md" />
            </View>
            <Text className="text-[10px] tracking-[3px] text-oro">MESA RESERVADA</Text>
            <Text className="mt-1 text-2xl font-extrabold text-crema">{user.name}</Text>
            <Text className="mt-1 text-sm text-oro/80">{user.email}</Text>
          </View>

          <Pressable
            onPress={() => {
              onClose();
              router.push(user.role === 'admin' ? '/administracion' : '/perfil');
            }}
            className="mx-4 mt-4 flex-row items-center justify-between rounded-2xl bg-white px-4 py-4">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-marca-oscura">
                <IconoNav name="person-outline" size={18} className="text-oro" />
              </View>
              <Text className="text-base font-semibold text-marca-oscura">Mi Perfil</Text>
            </View>
            <IconoNav name="chevron-forward" size={16} className="text-oro" />
          </Pressable>

          <Pressable
            onPress={() => {
              logout();
              onClose();
              router.push('/');
            }}
            className="mx-4 mb-5 mt-2 flex-row items-center justify-center gap-2 rounded-2xl py-4">
            <IconoNav name="log-out-outline" size={18} className="text-marca" />
            <Text className="font-semibold text-marca">Cerrar sesión</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
