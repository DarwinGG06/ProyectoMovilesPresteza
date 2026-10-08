import { Text, View } from 'react-native';

import { TarjetaPerfil } from '@/features/perfil/components/TarjetaPerfil';
import type { CasaReservas } from '@/features/reservas/hooks/useReservas';
import type { Reserva } from '@/features/reservas/types';

import { useTabReservas } from '../../hooks/useTabReservas';
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
  reservas: CasaReservas;
};

export function TabReservas({ reservas }: TabReservasProps) {
  const tab = useTabReservas(reservas);

  const acciones = (reserva: Reserva) => (
    <AccionesAdmin>
      <EnlaceAdmin etiqueta="EDITAR" onPress={() => tab.abrir(reserva)} />
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
        accion={{ etiqueta: 'AGREGAR', onPress: () => tab.abrir() }}>
        <InterruptorVista
          vista={tab.vista}
          onChange={tab.setVista}
          filtrosAbiertos={tab.filtrosAbiertos}
          onFiltros={() => tab.setFiltrosAbiertos((abierto) => !abierto)}
        />
        {tab.filtrosAbiertos ? (
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
        ) : tab.vista === 'lista' ? (
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

      <ModalAdmin visible={tab.abierto} titulo={tab.editando ? 'Editar reserva' : 'Nueva reserva'} onCerrar={tab.cerrar}>
        <FormularioReservaAdmin
          key={tab.editando ? reservas.idDe(tab.editando) : 'nueva'}
          valores={tab.valoresFormulario}
          mesas={reservas.mesas}
          onCancelar={tab.cerrar}
          onGuardar={tab.guardar}
          guardando={reservas.guardando}
        />
      </ModalAdmin>
    </View>
  );
}
