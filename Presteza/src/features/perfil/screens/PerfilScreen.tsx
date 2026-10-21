import { router } from 'expo-router';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import Button from '@/components/Button';
import { EvitarTeclado } from '@/shared/components/evitar-teclado/EvitarTeclado';
import { Footer } from '@/shared/components/footer';
import { SelloP } from '@/shared/components/nav-bar/SelloP';

import { HeroPerfil } from '../components/HeroPerfil';
import { InvitadoPerfil } from '../components/InvitadoPerfil';
import { EncabezadoSeccion, PestanasPerfil } from '../components/PestanasPerfil';
import { TabAjustes } from '../components/tabs/TabAjustes';
import { TabDirecciones } from '../components/tabs/TabDirecciones';
import { TabPagos } from '../components/tabs/TabPagos';
import { TabPedidos } from '../components/tabs/TabPedidos';
import { TabPuntos } from '../components/tabs/TabPuntos';
import { TabReservas } from '../components/tabs/TabReservas';
import { usePerfil } from '../hooks/usePerfil';

export function PerfilScreen() {
  const {
    isAuthenticated,
    logout,
    user,
    token,
    perfil,
    setPerfil,
    pedidos,
    reservas,
    setReservas,
    cargando,
    error,
    pestana,
    setPestana,
  } = usePerfil();

  if (!isAuthenticated || !user) {
    return <InvitadoPerfil />;
  }

  if (cargando && !perfil) {
    return (
      <View className="flex-1 items-center justify-center bg-marca-oscura">
        <SelloP size="md" />
        <View className="mt-6">
          <ActivityIndicator color="#d4af77" />
        </View>
        <Text className="mt-3 font-roboto text-sm text-crema/50">Cargando tu mesa...</Text>
      </View>
    );
  }

  if (!perfil || !token) {
    return (
      <View className="flex-1 items-center justify-center bg-marca-oscura px-6">
        <Text className="text-center font-roboto text-crema">
          {error || 'No pudimos cargar tu perfil.'}
        </Text>
      </View>
    );
  }

  const enMesa = pestana === 'cuenta';

  return (
    <EvitarTeclado>
      <View className="flex-1 bg-marca-oscura">
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag">
          {enMesa ? (
            <HeroPerfil
              nombre={perfil.complete_name || user.name}
              email={perfil.email || user.email}
              puntos={perfil.points}
              nivel={perfil.loyaltyTier}
              onAjustes={() => setPestana('ajustes')}
            />
          ) : (
            <EncabezadoSeccion
              pestana={pestana}
              onVolver={() => setPestana('cuenta')}
              contador={
                pestana === 'pedidos'
                  ? pedidos.length
                  : pestana === 'reservas'
                    ? reservas.length
                    : undefined
              }
            />
          )}

          <View className="px-6 pb-12 pt-2">
            {error ? <Text className="mb-4 font-roboto text-sm text-crema">{error}</Text> : null}

            {enMesa ? (
              <>
                <PestanasPerfil
                  onChange={setPestana}
                  contadores={{
                    pedidos: pedidos.length,
                    reservas: reservas.length,
                  }}
                />
                <Button
                  text="VER LA CARTA"
                  variant="gold"
                  className="mt-4"
                  onPress={() => router.push('/home/menu')}
                />
              </>
            ) : null}

            {enMesa ? null : (
              <View className="mt-6">
                {pestana === 'puntos' ? (
                  <TabPuntos userId={user.id} token={token} perfil={perfil} />
                ) : null}
                {pestana === 'pedidos' ? <TabPedidos pedidos={pedidos} /> : null}
                {pestana === 'direcciones' ? (
                  <TabDirecciones userId={user.id} perfil={perfil} onActualizado={setPerfil} />
                ) : null}
                {pestana === 'pagos' ? (
                  <TabPagos userId={user.id} token={token} perfil={perfil} onActualizado={setPerfil} />
                ) : null}
                {pestana === 'reservas' ? (
                  <TabReservas onCambio={(lista) => setReservas(lista)} />
                ) : null}
                {pestana === 'ajustes' ? (
                  <TabAjustes
                    userId={user.id}
                    perfil={perfil}
                    onActualizado={setPerfil}
                    onCerrarSesion={logout}
                  />
                ) : null}
              </View>
            )}
          </View>
          <Footer />
        </ScrollView>
      </View>
    </EvitarTeclado>
  );
}
