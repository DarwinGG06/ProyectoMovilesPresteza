import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, Text, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import { isRunningInExpoGo } from 'expo';
import { planCumpleanios } from '@/shared/notificaciones/fechasCumpleanios';

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
  const [tickDir, setTickDir] = useState(0);
  const [tickPago, setTickPago] = useState(0);

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
        <Text className="mt-3 font-roboto text-sm text-crema/70">Cargando tu mesa...</Text>
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
              accion={
                pestana === 'reservas'
                  ? {
                      etiqueta: 'Nueva',
                      onPress: () => router.push('/home/reservas?desde=perfil' as Href),
                    }
                  : pestana === 'direcciones'
                    ? { etiqueta: 'Agregar', onPress: () => setTickDir((n) => n + 1) }
                    : pestana === 'pagos'
                      ? { etiqueta: 'Agregar', onPress: () => setTickPago((n) => n + 1) }
                      : undefined
              }
            />
          )}

          <View className="px-6 pb-12 pt-2">
            {__DEV__ && Platform.OS === 'android' ? (
              <Button
                text="PROBAR NOTIFICACION"
                variant="gold"
                className="mb-4"
                onPress={async () => {
                  try {
                    if (!isRunningInExpoGo()) {
                      await Notifications.setNotificationChannelAsync('presteza', {
                        name: 'Presteza',
                        importance: Notifications.AndroidImportance.HIGH,
                        sound: 'default',
                      });
                    }
                    let permiso = await Notifications.getPermissionsAsync();
                    if (!permiso.granted && permiso.canAskAgain) {
                      permiso = await Notifications.requestPermissionsAsync();
                    }
                    if (!permiso.granted) {
                      Alert.alert(
                        'Notificaciones desactivadas',
                        'Actívalas en Ajustes del celular → Aplicaciones → Expo Go → Notificaciones.'
                      );
                      return;
                    }
                    const plan = planCumpleanios(perfil);
                    const textoRegistros = await SecureStore.getItemAsync('presteza.cumpleanios.registros');
                    const registros = JSON.parse(textoRegistros || '{}');
                    const idAutomatico = plan ? `cumpleanios-${perfil.id}-${plan.periodo}` : null;
                    const registroAnterior = idAutomatico ? registros[idAutomatico] : null;
                    const pendientes = await Notifications.getAllScheduledNotificationsAsync();
                    const avisoPendiente = pendientes.some((aviso) => aviso.identifier === idAutomatico);

                    // La prueba es independiente del beneficio y del historial automático.
                    await Notifications.scheduleNotificationAsync({
                      content: {
                        title: '¡Celebra tu cumpleaños en Presteza!',
                        body:
                          'Tu beneficio de cumpleaños está disponible: ' +
                          '15 % de descuento, una vez al año y sin combinar con puntos.',
                        sound: 'default',
                        data: {
                          tipo: 'prueba_cumpleanios',
                          href: '/perfil?pestana=puntos',
                        },
                      },
                      trigger: {
                        type: Notifications.SchedulableTriggerInputTypes.DATE,
                        date: new Date(Date.now() + 15_000),
                        ...(!isRunningInExpoGo() ? { channelId: 'presteza' } : {}),
                      },
                    });
                    const diagnostico = [
                      `Rol: ${user.role}`,
                      `Nacimiento: ${perfil.birthDate ?? 'Sin fecha'}`,
                      `Beneficio disponible: ${String(perfil.birthdayEligible)}`,
                      `Año usado: ${perfil.birthdayBenefitYear ?? 'Ninguno'}`,
                      `Aviso automático: ${plan ? plan.fechaAviso.toLocaleString() : 'Sin fecha'}`,
                      `Pendiente en Android: ${avisoPendiente ? 'Sí' : 'No'}`,
                      `Registro anterior: ${registroAnterior ? new Date(registroAnterior.fecha).toLocaleString() : 'Ninguno'}`,
                    ].join('\n');
                    console.log('[Diagnostico cumpleanios]', diagnostico);
                    Alert.alert('Prueba programada para dentro de 15 segundos', diagnostico);
                  } catch (error) {
                    Alert.alert('No se pudo programar la prueba', error instanceof Error ? error.message : String(error));
                  }
                }}
              />
            ) : null}
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
                  <TabDirecciones
                    userId={user.id}
                    perfil={perfil}
                    onActualizado={setPerfil}
                    abrirTick={tickDir}
                  />
                ) : null}
                {pestana === 'pagos' ? (
                  <TabPagos
                    userId={user.id}
                    token={token}
                    perfil={perfil}
                    onActualizado={setPerfil}
                    abrirTick={tickPago}
                  />
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
