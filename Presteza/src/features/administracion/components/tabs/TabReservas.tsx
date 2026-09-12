import { useState } from 'react';
import { Text, View } from 'react-native';

import { TarjetaPerfil } from '@/features/perfil/components/TarjetaPerfil';
import { useReservas } from '@/features/reservas/hooks/useReservas';
import type { Reserva } from '@/features/reservas/types';

import type { ReservaAdmin } from '../../types';
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
  onCambio?: (reservas: ReservaAdmin[]) => void;
};

export function TabReservas({ onCambio }: TabReservasProps) {
  const [vista, setVista] = useState<'lista' | 'cuadricula'>('lista');
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(true);
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState<Reserva | null>(null);
  const reservas = useReservas({
    alcance: 'todas',
    onCambio: onCambio as ((lista: Reserva[]) => void) | undefined,
  });

  const abrir = (reserva?: Reserva) => {
    setEditando(reserva ?? null);
    setAbierto(true);
  };

  const acciones = (reserva: Reserva) => (
    <AccionesAdmin>
      <EnlaceAdmin etiqueta="EDITAR" onPress={() => abrir(reserva)} />
      {reserva.status === 'pending' ? <EnlaceAdmin etiqueta="CONFIRMAR" onPress={() => reservas.confirmar(reserva)} /> : null}
      {reservas.sePuedeEditar(reserva) ? (
        <EnlaceAdmin etiqueta="CANCELAR" peligro onPress={() => reservas.cancelar(reserva)} />
      ) : null}
      {reserva.status === 'confirmed' ? (
        <EnlaceAdmin etiqueta="COMPLETAR" onPress={() => reservas.completar(reserva)} />
      ) : null}
      <EnlaceAdmin etiqueta="ELIMINAR" peligro onPress={() => reservas.eliminar(reserva)} />
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
              <ChipFiltro
                key={item.id}
                etiqueta={item.etiqueta}
                activo={reservas.filtro === item.id}
                onPress={() => reservas.setFiltro(item.id)}
              />
            ))}
          </FilaFiltros>
        ) : null}

        {reservas.lista.length === 0 ? (
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
            {reservas.lista.map((reserva) => (
              <FilaTabla key={reservas.idDe(reserva)}>
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
                    {reservas.textoEstado(reserva.status).toUpperCase()}
                  </Text>
                </CeldaTabla>
              </FilaTabla>
            ))}
          </View>
        ) : (
          <GrillaAdmin>
            {reservas.lista.map((reserva) => (
              <CajaCuadricula key={reservas.idDe(reserva)}>
                <Text className="text-[10px] tracking-[1px] text-oro">{reservas.textoEstado(reserva.status).toUpperCase()}</Text>
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
          key={editando ? reservas.idDe(editando) : 'nueva'}
          valores={reservas.valoresDe(editando ?? undefined)}
          mesas={reservas.mesas}
          onCancelar={() => setAbierto(false)}
          onGuardar={async (datos) => {
            if (await reservas.guardar(datos, editando)) setAbierto(false);
          }}
          guardando={reservas.guardando}
        />
      </ModalAdmin>
    </View>
  );
}
