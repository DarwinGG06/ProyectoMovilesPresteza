import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { useReservas } from '@/features/reservas/hooks/useReservas';
import type { Reserva } from '@/features/reservas/types';

import { formatFecha } from '../../utils';
import { AccionesFila, Comanda, EnlaceAccion, LineaCuenta } from '../elementos';
import { FormularioReserva } from '../formularios/FormularioReserva';
import { EstadoVacio, Mensaje, TarjetaPerfil } from '../TarjetaPerfil';

type TabReservasProps = {
  onCambio?: (reservas: Reserva[]) => void;
};

export function TabReservas({ onCambio }: TabReservasProps) {
  const [editando, setEditando] = useState<Reserva | null>(null);
  const reservas = useReservas({ alcance: 'mias', onCambio });

  return (
    <TarjetaPerfil
      numero="I"
      badge="RESERVAS"
      titulo="Tus mesas"
      accion={{ etiqueta: 'NUEVA', onPress: () => router.push('/reservas') }}>
      {reservas.error ? <Mensaje texto={reservas.error} error /> : null}

      {editando ? (
        <Comanda>
          <Text className="mb-3 text-sm text-texto/55">Mesa {editando.tableNumber}. La mesa no se puede cambiar.</Text>
          <FormularioReserva
            valores={{
              date: editando.date,
              time: editando.time,
              numberOfPeople: String(editando.numberOfPeople),
              specialRequests: editando.specialRequests ?? '',
            }}
            onCancelar={() => setEditando(null)}
            onGuardar={async (datos) => {
              const ok = await reservas.editar(editando, {
                tableNumber: editando.tableNumber,
                date: datos.date,
                time: datos.time,
                numberOfPeople: datos.numberOfPeople,
                specialRequests: datos.specialRequests,
              });
              if (ok) setEditando(null);
            }}
            guardando={reservas.guardando}
          />
        </Comanda>
      ) : reservas.lista.length === 0 ? (
        <EstadoVacio
          icono="calendar-outline"
          titulo="No tienes reservas"
          texto="Reserva una mesa en Milán cuando quieras."
          accion={{ etiqueta: 'RESERVAR', onPress: () => router.push('/reservas') }}
        />
      ) : (
        <View>
          {reservas.lista.map((reserva, index) => (
            <LineaCuenta
              key={reservas.idDe(reserva)}
              indice={index}
              titulo={`Mesa ${reserva.tableNumber}`}
              sello={reservas.textoEstado(reserva.status).toUpperCase()}>
              <Text className="mt-1 text-sm text-crema/70">
                {reserva.date} · {reserva.time}
              </Text>
              <Text className="mt-1 text-sm text-crema/45">
                {reserva.numberOfPeople} {reserva.numberOfPeople === 1 ? 'persona' : 'personas'}
              </Text>
              {reserva.specialRequests ? (
                <Text className="mt-2 text-sm italic text-crema/50">{reserva.specialRequests}</Text>
              ) : null}
              {reserva.createdAt ? (
                <Text className="mt-2 text-xs text-crema/35">Hecha el {formatFecha(reserva.createdAt)}</Text>
              ) : null}
              {reserva.status === 'cancelled' ? (
                <Text className="mt-2 text-sm text-red-300">Esta reserva fue cancelada.</Text>
              ) : null}
              {reservas.sePuedeEditar(reserva) ? (
                <AccionesFila>
                  <EnlaceAccion etiqueta="EDITAR" onPress={() => setEditando(reserva)} />
                  <EnlaceAccion etiqueta="ELIMINAR" onPress={() => reservas.eliminar(reserva)} peligro />
                </AccionesFila>
              ) : null}
            </LineaCuenta>
          ))}
        </View>
      )}
    </TarjetaPerfil>
  );
}
