import { Text, View } from 'react-native';

import type { Reserva } from '@/features/reservas/types';

import { useReservasPerfil } from '../../hooks/useReservasPerfil';
import { formatFecha } from '../../utils';
import { AccionesFila, Comanda, EnlaceAccion, LineaCuenta } from '../elementos';
import { FormularioReserva } from '../formularios/FormularioReserva';
import { EstadoVacio, Mensaje, TarjetaPerfil } from '../TarjetaPerfil';

type TabReservasProps = {
  onCambio?: (reservas: Reserva[]) => void;
};

export function TabReservas({ onCambio }: TabReservasProps) {
  const reservas = useReservasPerfil(onCambio);

  return (
    <TarjetaPerfil
      numero="I"
      badge="RESERVAS"
      titulo="Tus mesas"
      accion={{ etiqueta: 'NUEVA', onPress: reservas.irAReservas }}>
      {reservas.error ? <Mensaje texto={reservas.error} error /> : null}

      {reservas.edicion ? (
        <Comanda>
          <Text className="mb-3 font-roboto text-sm text-texto/55">
            Mesa {reservas.edicion.mesa}. La mesa no se puede cambiar.
          </Text>
          <FormularioReserva
            valores={reservas.edicion.valores}
            onCancelar={reservas.cancelar}
            onGuardar={reservas.guardar}
            guardando={reservas.guardando}
          />
        </Comanda>
      ) : reservas.lista.length === 0 ? (
        <EstadoVacio
          icono="calendar-outline"
          titulo="No tienes reservas"
          texto="Reserva una mesa en Milán cuando quieras."
          accion={{ etiqueta: 'RESERVAR', onPress: reservas.irAReservas }}
        />
      ) : (
        <View>
          {reservas.lista.map((reserva, index) => (
            <LineaCuenta
              key={reservas.idDe(reserva)}
              indice={index}
              titulo={`Mesa ${reserva.tableNumber}`}
              sello={reservas.textoEstado(reserva.status).toUpperCase()}>
              <Text className="mt-1 font-roboto text-sm text-crema/70">
                {reserva.date} · {reserva.time}
              </Text>
              <Text className="mt-1 font-roboto text-sm text-crema/45">
                {reserva.numberOfPeople} {reserva.numberOfPeople === 1 ? 'persona' : 'personas'}
              </Text>
              {reserva.specialRequests ? (
                <Text className="mt-2 font-roboto text-sm italic text-crema/50">
                  {reserva.specialRequests}
                </Text>
              ) : null}
              {reserva.createdAt ? (
                <Text className="mt-2 font-roboto text-xs text-crema/35">
                  Hecha el {formatFecha(reserva.createdAt)}
                </Text>
              ) : null}
              {reserva.status === 'cancelled' ? (
                <Text className="mt-2 font-roboto text-sm text-red-300">
                  Esta reserva fue cancelada.
                </Text>
              ) : null}
              {reservas.sePuedeEditar(reserva) ? (
                <AccionesFila>
                  <EnlaceAccion etiqueta="EDITAR" onPress={() => reservas.editar(reserva)} />
                  <EnlaceAccion
                    etiqueta="ELIMINAR"
                    onPress={() => reservas.eliminar(reserva)}
                    peligro
                  />
                </AccionesFila>
              ) : null}
            </LineaCuenta>
          ))}
        </View>
      )}
    </TarjetaPerfil>
  );
}
