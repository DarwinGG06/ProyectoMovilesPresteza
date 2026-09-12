import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { TarjetaPerfil } from '@/features/perfil/components/TarjetaPerfil';
import { useAviso } from '@/shared/components/aviso';

import {
  actualizarEstadoReserva,
  actualizarReserva,
  crearReserva,
  eliminarReserva,
  listarMesas,
} from '../../api/adminApi';
import type { MesaAdmin, ReservaAdmin, ReservaFormAdmin } from '../../types';
import { idDe, textoEstadoReserva } from '../../utils';
import { AccionesAdmin, ChipFiltro, EnlaceAdmin, EstadoVacioAdmin, ModalAdmin } from '../elementos';
import { FormularioReservaAdmin } from '../formularios/FormularioReservaAdmin';
import {
  CajaCuadricula,
  CeldaTabla,
  EncabezadoTabla,
  FilaFiltros,
  FilaTabla,
  GrillaAdmin,
  InterruptorVista,
} from '../VistaCarta';

const FILTROS = [
  { id: 'all', etiqueta: 'TODAS' },
  { id: 'pending', etiqueta: 'PENDIENTES' },
  { id: 'confirmed', etiqueta: 'CONFIRMADAS' },
  { id: 'cancelled', etiqueta: 'CANCELADAS' },
  { id: 'completed', etiqueta: 'COMPLETADAS' },
] as const;

type TabReservasProps = {
  token: string;
  reservas: ReservaAdmin[];
  setReservas: (reservas: ReservaAdmin[]) => void;
};

function valoresDe(reserva?: ReservaAdmin): ReservaFormAdmin {
  return {
    tableNumber: reserva?.tableNumber ?? '',
    date: reserva?.date ?? '',
    time: reserva?.time ?? '',
    numberOfPeople: reserva ? String(reserva.numberOfPeople) : '',
    specialRequests: reserva?.specialRequests ?? '',
  };
}

export function TabReservas({ token, reservas, setReservas }: TabReservasProps) {
  const [filtro, setFiltro] = useState<(typeof FILTROS)[number]['id']>('all');
  const [vista, setVista] = useState<'lista' | 'cuadricula'>('lista');
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(true);
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState<ReservaAdmin | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [mesas, setMesas] = useState<MesaAdmin[]>([]);
  const aviso = useAviso();

  useEffect(() => {
    void listarMesas().then(setMesas);
  }, []);

  const lista = useMemo(() => {
    const ordenadas = [...reservas].sort(
      (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
    );
    if (filtro === 'all') return ordenadas;
    return ordenadas.filter((reserva) => reserva.status === filtro);
  }, [filtro, reservas]);

  const abrir = (reserva?: ReservaAdmin) => {
    setEditando(reserva ?? null);
    setAbierto(true);
  };

  const guardar = async (datos: ReservaFormAdmin) => {
    if (!datos.tableNumber.trim()) {
      aviso.error('Reserva', 'Elige una mesa.');
      return;
    }

    const cuerpo = {
      tableNumber: datos.tableNumber.trim(),
      date: datos.date.trim(),
      time: datos.time.trim(),
      numberOfPeople: Number(datos.numberOfPeople),
      specialRequests: datos.specialRequests.trim() || undefined,
    };

    setGuardando(true);
    try {
      if (editando) {
        const actualizado = await actualizarReserva(token, idDe(editando), cuerpo);
        setReservas(reservas.map((item) => (idDe(item) === idDe(editando) ? { ...item, ...actualizado, ...cuerpo } : item)));
        aviso.ok('Reserva editada', `La mesa ${cuerpo.tableNumber} fue editada.`);
      } else {
        setReservas([await crearReserva(token, cuerpo), ...reservas]);
        aviso.ok('Reserva creada', `La mesa ${cuerpo.tableNumber} quedó reservada.`);
      }
      setAbierto(false);
    } catch (err) {
      aviso.errorDe(err, 'No se pudo guardar.', 'Reserva');
    } finally {
      setGuardando(false);
    }
  };

  const cambiar = (reserva: ReservaAdmin, status: string) => {
    const id = idDe(reserva);
    const aplicar = async () => {
      await actualizarEstadoReserva(token, id, status);
      setReservas(reservas.map((item) => (idDe(item) === id ? { ...item, status } : item)));
    };

    if (status === 'cancelled') {
      aviso.confirmar({
        sello: 'MESAS',
        titulo: 'Cancelar reserva',
        texto: `¿Cancelar la mesa ${reserva.tableNumber}?`,
        confirmar: 'CANCELAR RESERVA',
        peligro: true,
        exito: {
          titulo: 'Reserva cancelada',
          texto: `La mesa ${reserva.tableNumber} fue cancelada.`,
        },
        onConfirmar: aplicar,
      });
      return;
    }

    void aplicar()
      .then(() =>
        aviso.ok(
          status === 'confirmed' ? 'Reserva confirmada' : 'Reserva completada',
          status === 'confirmed'
            ? `La mesa ${reserva.tableNumber} fue confirmada.`
            : `La mesa ${reserva.tableNumber} fue completada.`,
        ),
      )
      .catch((err) => aviso.errorDe(err, 'No se pudo actualizar.', 'Reserva'));
  };

  const borrar = (reserva: ReservaAdmin) => {
    aviso.confirmar({
      sello: 'MESAS',
      titulo: 'Eliminar reserva',
      texto: `¿Borrar la mesa ${reserva.tableNumber} del ${reserva.date}?`,
      confirmar: 'ELIMINAR',
      peligro: true,
      exito: {
        titulo: 'Reserva eliminada',
        texto: `La reserva de la mesa ${reserva.tableNumber} fue eliminada.`,
      },
      onConfirmar: async () => {
        await eliminarReserva(token, idDe(reserva));
        setReservas(reservas.filter((item) => idDe(item) !== idDe(reserva)));
      },
    });
  };

  const acciones = (reserva: ReservaAdmin) => (
    <AccionesAdmin>
      <EnlaceAdmin etiqueta="EDITAR" onPress={() => abrir(reserva)} />
      {reserva.status === 'pending' ? <EnlaceAdmin etiqueta="CONFIRMAR" onPress={() => cambiar(reserva, 'confirmed')} /> : null}
      {reserva.status === 'pending' || reserva.status === 'confirmed' ? (
        <EnlaceAdmin etiqueta="CANCELAR" peligro onPress={() => cambiar(reserva, 'cancelled')} />
      ) : null}
      {reserva.status === 'confirmed' ? (
        <EnlaceAdmin etiqueta="COMPLETAR" onPress={() => cambiar(reserva, 'completed')} />
      ) : null}
      <EnlaceAdmin etiqueta="ELIMINAR" peligro onPress={() => borrar(reserva)} />
    </AccionesAdmin>
  );

  return (
    <View>
      <TarjetaPerfil
        numero="I"
        badge="MESAS"
        titulo="Reservas"
        accion={{ etiqueta: 'AGREGAR', onPress: () => abrir() }}>
        <InterruptorVista
          vista={vista}
          onChange={setVista}
          filtrosAbiertos={filtrosAbiertos}
          onFiltros={() => setFiltrosAbiertos((abiertoFiltro) => !abiertoFiltro)}
        />
        {filtrosAbiertos ? (
          <FilaFiltros>
            {FILTROS.map((item) => (
              <ChipFiltro key={item.id} etiqueta={item.etiqueta} activo={filtro === item.id} onPress={() => setFiltro(item.id)} />
            ))}
          </FilaFiltros>
        ) : null}

        {lista.length === 0 ? (
          <EstadoVacioAdmin icono="calendar-outline" titulo="Sin reservas" texto="Crea una mesa o espera a que reserven." />
        ) : vista === 'lista' ? (
          <View>
            <EncabezadoTabla
              columnas={[
                { texto: 'MESA', flex: 1.1 },
                { texto: 'FECHA', flex: 1 },
                { texto: 'ESTADO', ancho: 86 },
              ]}
            />
            {lista.map((reserva) => (
              <FilaTabla key={idDe(reserva)}>
                <CeldaTabla flex={1.1}>
                  <Text className="text-sm font-light text-white">Mesa {reserva.tableNumber}</Text>
                  <Text className="mt-0.5 text-[11px] text-crema/55" numberOfLines={1}>
                    {reserva.userName || 'Cliente'}
                  </Text>
                  {acciones(reserva)}
                </CeldaTabla>
                <CeldaTabla flex={1}>
                  <Text className="text-sm text-crema/70">
                    {reserva.date} · {reserva.time}
                  </Text>
                  <Text className="mt-0.5 text-[11px] text-crema/45">{reserva.numberOfPeople} personas</Text>
                </CeldaTabla>
                <CeldaTabla ancho={86}>
                  <Text className="text-[10px] tracking-[1px] text-oro">
                    {textoEstadoReserva(reserva.status).toUpperCase()}
                  </Text>
                </CeldaTabla>
              </FilaTabla>
            ))}
          </View>
        ) : (
          <GrillaAdmin>
            {lista.map((reserva) => (
              <CajaCuadricula key={idDe(reserva)}>
                <Text className="text-[10px] tracking-[1px] text-oro">{textoEstadoReserva(reserva.status).toUpperCase()}</Text>
                <Text className="mt-1 text-xl font-light text-white">Mesa {reserva.tableNumber}</Text>
                <Text className="mt-1 text-sm text-crema/55">
                  {reserva.date} · {reserva.time}
                </Text>
                <Text className="mt-1 text-sm text-crema">{reserva.numberOfPeople} personas</Text>
                <Text className="mt-2 text-sm text-crema/70" numberOfLines={1}>
                  {reserva.userName || 'Cliente'}
                </Text>
                {acciones(reserva)}
              </CajaCuadricula>
            ))}
          </GrillaAdmin>
        )}
      </TarjetaPerfil>

      <ModalAdmin visible={abierto} titulo={editando ? 'Editar reserva' : 'Nueva reserva'} onCerrar={() => setAbierto(false)}>
        <FormularioReservaAdmin
          key={editando ? idDe(editando) : 'nueva'}
          valores={valoresDe(editando ?? undefined)}
          mesas={mesas}
          onCancelar={() => setAbierto(false)}
          onGuardar={guardar}
          guardando={guardando}
        />
      </ModalAdmin>
    </View>
  );
}
