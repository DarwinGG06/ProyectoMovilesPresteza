import { router, useFocusEffect, usePathname } from 'expo-router';
import { useCallback } from 'react';
import { BackHandler, ScrollView, View } from 'react-native';

import { useSession } from '@/session/context';
import { esAdmin } from '@/session/roles';
import { EvitarTeclado } from '@/shared/components/evitar-teclado/EvitarTeclado';
import { Footer } from '@/shared/components/footer';
import { Pergamino } from '@/shared/components/materiales/Pergamino';
import { LoginModal } from '@/shared/components/nav-bar/LoginModal';

import { FormularioNuevaReserva } from '../components/FormularioNuevaReserva';
import { HeroReservas } from '../components/HeroReservas';
import { PlanoMesas } from '../components/PlanoMesas';
import { SelectorCapacidad } from '../components/SelectorCapacidad';
import { useNuevaReserva } from '../hooks/useNuevaReserva';

export function ReservasScreen() {
  const { user } = useSession();
  const pathname = usePathname();
  const reserva = useNuevaReserva();

  useFocusEffect(
    useCallback(() => {
      if (!esAdmin(user)) return;
      if (pathname === '/home/reservas') {
        router.replace('/home/admin');
      }
    }, [pathname, user]),
  );

  useFocusEffect(
    useCallback(() => {
      if (!reserva.vinoDelPerfil) return undefined;
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        reserva.volver();
        return true;
      });
      return () => sub.remove();
    }, [reserva.vinoDelPerfil, reserva.volver]),
  );

  if (esAdmin(user)) return null;

  return (
    <>
      <EvitarTeclado>
        <View className="flex-1">
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag">
            <HeroReservas onVolver={reserva.vinoDelPerfil ? reserva.volver : undefined} />
            <Pergamino>
              <View className="px-4 py-6">
                <PlanoMesas
                  mesas={reserva.mesas}
                  mesaId={reserva.mesaId}
                  barra={reserva.barra}
                  personalizada={reserva.personalizada}
                  onMesa={reserva.elegirMesa}
                  onBarra={reserva.elegirBarra}
                  onPersonalizada={reserva.elegirPersonalizada}
                />

                {reserva.mostrarCapacidad ? (
                  <SelectorCapacidad
                    valor={reserva.personas}
                    onCambiar={reserva.cambiarPersonas}
                    detalle={reserva.detalleCapacidad}
                  />
                ) : null}

                <FormularioNuevaReserva
                  control={reserva.control}
                  subtitulo={reserva.subtitulo}
                  fecha={reserva.date}
                  hora={reserva.time}
                  onHora={reserva.elegirHora}
                  onEnviar={reserva.enviar}
                  guardando={reserva.guardando}
                  deshabilitado={reserva.deshabilitado}
                  etiqueta={reserva.etiqueta}
                  exito={reserva.exito}
                />
              </View>
            </Pergamino>
            <Footer />
          </ScrollView>
        </View>
      </EvitarTeclado>
      <LoginModal visible={reserva.loginAbierto} onClose={reserva.cerrarLogin} />
    </>
  );
}
