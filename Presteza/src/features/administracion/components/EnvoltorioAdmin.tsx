import { Redirect, type Href } from 'expo-router';
import { useEffect, useRef, type ReactNode } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { InvitadoPerfil } from '@/features/perfil/components/InvitadoPerfil';
import { rutaTrasSesion } from '@/session/roles';
import { useAviso } from '@/shared/components/aviso';
import { SelloP } from '@/shared/components/nav-bar/SelloP';

import { useAdminContext } from '../context/AdminContext';

type EnvoltorioAdminProps = {
  children: ReactNode;
};

export function EnvoltorioAdmin({ children }: EnvoltorioAdminProps) {
  const admin = useAdminContext();
  const aviso = useAviso();
  const { isAuthenticated, user } = admin;
  const avisado = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !user || user.role === 'admin') return;
    if (avisado.current) return;
    avisado.current = true;
    aviso.error('Administración', 'Solo el personal de la casa puede entrar aquí.');
  }, [aviso, isAuthenticated, user]);

  if (!isAuthenticated || !user) {
    return <InvitadoPerfil />;
  }

  if (user.role !== 'admin') {
    return (
      <View className="flex-1 items-center justify-center bg-crema px-8">
        <SelloP size="lg" />
        <Text className="mt-6 text-center font-serif text-[26px] leading-8 text-tinta">
          Solo personal
        </Text>
        <Text className="mt-3 text-center font-roboto text-sm leading-5 text-tinta/70">
          Esta zona es de administración. Te llevamos de vuelta a tu cuenta.
        </Text>
        <Redirect href={rutaTrasSesion(user) as Href} />
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
