import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { useAviso } from '@/shared/components/aviso';

import { actualizarReserva, eliminarReserva, idReserva } from '../../api/perfilApi';
import type { Reserva, ReservaForm } from '../../types';
import { formatFecha, textoEstadoReserva } from '../../utils';
import { AccionesFila, Comanda, EnlaceAccion, LineaCuenta } from '../elementos';
import { FormularioReserva } from '../formularios/FormularioReserva';
import { EstadoVacio, Mensaje, TarjetaPerfil } from '../TarjetaPerfil';

type TabReservasProps = {
  token: string;
  reservas: Reserva[];
  onCambio: (reservas: Reserva[]) => void;
};

export function TabReservas({ token, reservas, onCambio }: TabReservasProps) {
  const [editando, setEditando] = useState<Reserva | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const aviso = useAviso();

  const sePuedeEditar = (reserva: Reserva) => reserva.status === 'pending' || reserva.status === 'confirmed';

  const guardar = async (datos: ReservaForm) => {
    if (!editando) return;
    setError(null);
    setGuardando(true);
    try {
      const actualizada = await actualizarReserva(idReserva(editando), token, {
        date: datos.date,
        time: datos.time,
        numberOfPeople: Number(datos.numberOfPeople),
        specialRequests: datos.specialRequests || undefined,
      });
      onCambio(reservas.map((item) => (idReserva(item) === idReserva(editando) ? actualizada : item)));
      setEditando(null);
      aviso.ok('Reserva editada', `La mesa ${editando.tableNumber} fue editada.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la reserva.');
    } finally {
      setGuardando(false);
    }
  };

  const borrar = (reserva: Reserva) => {
    aviso.confirmar({
      sello: 'RESERVAS',
      titulo: 'Eliminar reserva',
      texto: `¿Eliminar la mesa ${reserva.tableNumber} del ${reserva.date} a las ${reserva.time}?`,
      confirmar: 'ELIMINAR',
      peligro: true,
      exito: {
        titulo: 'Reserva eliminada',
        texto: `La mesa ${reserva.tableNumber} fue eliminada.`,
      },
      onConfirmar: async () => {
        await eliminarReserva(idReserva(reserva), token);
        onCambio(reservas.filter((item) => idReserva(item) !== idReserva(reserva)));
      },
    });
  };

  return (
    <TarjetaPerfil
      numero="I"
      badge="RESERVAS"
      titulo="Tus mesas"
      accion={{ etiqueta: 'NUEVA', onPress: () => router.push('/reservas') }}>
      {error ? <Mensaje texto={error} error /> : null}

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
            onCancelar={() => {
              setEditando(null);
              setError(null);
            }}
            onGuardar={guardar}
            guardando={guardando}
          />
        </Comanda>
      ) : reservas.length === 0 ? (
        <EstadoVacio
          icono="calendar-outline"
          titulo="No tienes reservas"
          texto="Reserva una mesa en Milán cuando quieras."
          accion={{ etiqueta: 'RESERVAR', onPress: () => router.push('/reservas') }}
        />
      ) : (
        <View>
          {reservas.map((reserva, index) => (
            <LineaCuenta
              key={idReserva(reserva)}
              indice={index}
              titulo={`Mesa ${reserva.tableNumber}`}
              sello={textoEstadoReserva(reserva.status).toUpperCase()}>
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
              {sePuedeEditar(reserva) ? (
                <AccionesFila>
                  <EnlaceAccion etiqueta="EDITAR" onPress={() => setEditando(reserva)} />
                  <EnlaceAccion etiqueta="ELIMINAR" onPress={() => borrar(reserva)} peligro />
                </AccionesFila>
              ) : null}
            </LineaCuenta>
          ))}
        </View>
      )}
    </TarjetaPerfil>
  );
}
