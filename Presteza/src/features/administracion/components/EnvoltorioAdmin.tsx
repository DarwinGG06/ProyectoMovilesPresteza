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
      <View className="flex-1 items-center justify-center bg-marca-oscura">
        <ActivityIndicator color="#d4af77" />
      </View>
    );
  }

  if (admin.cargando && !admin.pedidos.length && !admin.productos.length) {
    return (
      <View className="flex-1 items-center justify-center bg-marca-oscura">
        <SelloP size="lg" />
        <View className="mt-6">
          <ActivityIndicator color="#d4af77" />
        </View>
        <Text className="mt-3 text-sm text-crema/70">Abriendo la casa...</Text>
      </View>
    );
  }

  if (!admin.token) {
    return <InvitadoPerfil />;
  }

  return <View className="flex-1 bg-marca-oscura">{children}</View>;
}
