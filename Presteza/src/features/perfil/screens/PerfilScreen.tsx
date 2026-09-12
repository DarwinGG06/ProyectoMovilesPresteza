import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { useAuth } from '@/auth/AuthContext';
import { Footer } from '@/shared/components/footer';
import { SelloP } from '@/shared/components/nav-bar/SelloP';

import { HeroPerfil } from '../components/HeroPerfil';
import { InvitadoPerfil } from '../components/InvitadoPerfil';
import { PestanasPerfil } from '../components/PestanasPerfil';
import { TabAjustes } from '../components/tabs/TabAjustes';
import { TabCuenta } from '../components/tabs/TabCuenta';
import { TabDirecciones } from '../components/tabs/TabDirecciones';
import { TabPagos } from '../components/tabs/TabPagos';
import { TabPedidos } from '../components/tabs/TabPedidos';
import { TabReservas } from '../components/tabs/TabReservas';
import { usePerfil } from '../hooks/usePerfil';
import type { PestanaId } from '../types';
import { formatFecha } from '../utils';

export function PerfilScreen() {
  const { isAuthenticated, logout } = useAuth();
  const { user, token, perfil, setPerfil, pedidos, reservas, setReservas, favoritos, cargando, error } =
    usePerfil();
  const [pestana, setPestana] = useState<PestanaId>('cuenta');

  useEffect(() => {
    if (user?.role === 'admin') {
      router.replace('/administracion');
    }
  }, [user?.role]);

  if (!isAuthenticated || !user) {
    return <InvitadoPerfil />;
  }

  if (cargando && !perfil) {
    return (
      <View className="flex-1 items-center justify-center bg-marca-oscura">
        <SelloP size="lg" />
        <View className="mt-6">
          <ActivityIndicator color="#d4af77" />
        </View>
        <Text className="mt-3 text-sm text-crema/70">Cargando tu mesa...</Text>
      </View>
    );
  }

  if (!perfil || !token) {
    return (
      <View className="flex-1 items-center justify-center bg-marca-oscura px-6">
        <Text className="text-center text-crema">{error || 'No pudimos cargar tu perfil.'}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-marca-oscura">
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <HeroPerfil
          nombre={perfil.complete_name || user.name}
          email={perfil.email || user.email}
          miembroDesde={formatFecha(perfil.created_at)}
        />
        <PestanasPerfil
          activa={pestana}
          onChange={setPestana}
          contadores={{
            pedidos: pedidos.length,
            direcciones: perfil.addresses.length,
            pagos: perfil.paymentCards.length,
            reservas: reservas.length,
          }}
        />

        <View className="px-5 pb-10 pt-6">
          {error ? <Text className="mb-4 text-sm text-red-300">{error}</Text> : null}

          {pestana === 'cuenta' ? (
            <TabCuenta userId={user.id} perfil={perfil} favoritos={favoritos} onActualizado={setPerfil} />
          ) : null}
          {pestana === 'pedidos' ? <TabPedidos pedidos={pedidos} /> : null}
          {pestana === 'direcciones' ? (
            <TabDirecciones userId={user.id} perfil={perfil} onActualizado={setPerfil} />
          ) : null}
          {pestana === 'pagos' ? (
            <TabPagos userId={user.id} token={token} perfil={perfil} onActualizado={setPerfil} />
          ) : null}
          {pestana === 'reservas' ? <TabReservas onCambio={setReservas} /> : null}
          {pestana === 'ajustes' ? (
            <TabAjustes
              userId={user.id}
              perfil={perfil}
              onActualizado={setPerfil}
              onCerrarSesion={logout}
            />
          ) : null}
        </View>
        <Footer />
      </ScrollView>
    </View>
  );
}
