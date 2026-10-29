import { type ReactNode } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { InvitadoPerfil } from '@/features/perfil/components/InvitadoPerfil';
import { SelloP } from '@/shared/components/nav-bar/SelloP';

import { useAdminContext } from '../context/AdminContext';

type EnvoltorioAdminProps = {
  children: ReactNode;
};

export function EnvoltorioAdmin({ children }: EnvoltorioAdminProps) {
  const admin = useAdminContext();
  const { isAuthenticated, user } = admin;

  if (!isAuthenticated || !user) {
    return <InvitadoPerfil />;
  }

  if (user.role !== 'admin') {
    return (
      <View className="flex-1 items-center justify-center bg-crema">
        <ActivityIndicator color="#6b1d3d" />
      </View>
    );
  }

  if (admin.cargando && !admin.pedidos.length && !admin.productos.length) {
    return (
      <View className="flex-1 items-center justify-center bg-crema">
        <SelloP size="lg" />
        <View className="mt-6">
          <ActivityIndicator color="#6b1d3d" />
        </View>
        <Text className="mt-3 font-roboto text-sm text-tinta/70">Abriendo la casa...</Text>
      </View>
    );
  }

  if (!admin.token) {
    return <InvitadoPerfil />;
  }

  return <View className="flex-1 bg-crema">{children}</View>;
}
