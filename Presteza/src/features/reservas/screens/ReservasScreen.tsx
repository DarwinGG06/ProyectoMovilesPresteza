import { ScrollView, View } from 'react-native';

import { EvitarTeclado } from '@/shared/components/evitar-teclado/EvitarTeclado';
import { Footer } from '@/shared/components/footer';
import { LoginModal } from '@/shared/components/nav-bar/LoginModal';

import { FormularioNuevaReserva } from '../components/FormularioNuevaReserva';
import { HeroReservas } from '../components/HeroReservas';
import { PlanoMesas } from '../components/PlanoMesas';
import { SelectorCapacidad } from '../components/SelectorCapacidad';
import { useNuevaReserva } from '../hooks/useNuevaReserva';

export function ReservasScreen() {
  const reserva = useNuevaReserva();

  return (
    <>
    <EvitarTeclado>
      <View className="flex-1 bg-crema">
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        <HeroReservas />

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

        <Footer />
        </ScrollView>
      </View>
    </EvitarTeclado>
      <LoginModal visible={reserva.loginAbierto} onClose={reserva.cerrarLogin} />
    </>
  );
}
