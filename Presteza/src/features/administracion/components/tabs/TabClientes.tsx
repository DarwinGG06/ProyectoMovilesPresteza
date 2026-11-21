import { Text, View } from 'react-native';

import CampoBusqueda from '@/components/CampoBusqueda';
import { TarjetaPerfil } from '@/features/perfil/components/TarjetaPerfil';
import { formatCOP } from '@/services/cart/CartContext';

import { useTabClientes } from '../../hooks/useTabClientes';
import type { ClienteAdmin, ClienteForm } from '../../types';
import { iniciales } from '../../utils';
import {
  AccionesAdmin,
  BotonAgregarAdmin,
  ChipFiltro,
  EnlaceAdmin,
  EstadoVacioAdmin,
  ModalAdmin,
} from '../elementos';
import { FormularioCliente } from '../formularios/FormularioCliente';
import {
  CajaCuadricula,
  CeldaTabla,
  EncabezadoTabla,
  FilaFiltros,
  FilaTabla,
  GrillaAdmin,
  InterruptorVista,
} from '../VistaCarta';

type TabClientesProps = {
  clientes: ClienteAdmin[];
  guardando?: boolean;
  onGuardar: (datos: ClienteForm, editando?: ClienteAdmin | null) => Promise<boolean>;
  onEliminar: (cliente: ClienteAdmin) => void;
};

export function TabClientes({ clientes, guardando, onGuardar, onEliminar }: TabClientesProps) {
  const tab = useTabClientes(clientes, onGuardar);

  return (
    <View>
      <TarjetaPerfil numero="I" badge="MESA" titulo="Clientes" compacto>
        <BotonAgregarAdmin onPress={() => tab.abrir()} />
        <CampoBusqueda
          value={tab.busqueda}
          onChangeText={tab.setBusqueda}
          placeholder="Buscar cliente..."
          variant="claro"
        />
        <InterruptorVista
          vista={tab.vista}
          onChange={tab.setVista}
          filtrosAbiertos={tab.filtrosAbiertos}
          onFiltros={() => tab.setFiltrosAbiertos((prev) => !prev)}
        />
        {tab.filtrosAbiertos ? (
          <FilaFiltros>
            <ChipFiltro
              etiqueta="TODOS"
              activo={tab.filtro === 'all'}
              onPress={() => tab.setFiltro('all')}
            />
            <ChipFiltro
              etiqueta="CON PEDIDOS"
              activo={tab.filtro === 'pedidos'}
              onPress={() => tab.setFiltro('pedidos')}
            />
            <ChipFiltro
              etiqueta="CON RESERVAS"
              activo={tab.filtro === 'reservas'}
              onPress={() => tab.setFiltro('reservas')}
            />
          </FilaFiltros>
        ) : null}
        {tab.lista.length === 0 ? (
          <EstadoVacioAdmin
            icono="people-outline"
            titulo="Sin clientes"
            texto="Crea el primero o espera a que se registren."
          />
        ) : tab.vista === 'lista' ? (
          <View>
            <EncabezadoTabla
              columnas={[
                { texto: 'CLIENTE', flex: 1.4 },
                { texto: 'PEDIDOS', ancho: 68, derecha: true },
                { texto: 'RESERVAS', ancho: 72, derecha: true },
              ]}
            />
            {tab.lista.map((cliente) => (
              <FilaTabla key={cliente.id}>
                <CeldaTabla flex={1.4}>
                  <Text className="font-roboto-light text-sm text-tinta" numberOfLines={1}>
                    {cliente.name}
                  </Text>
                  {cliente.email ? (
                    <Text
                      className="mt-0.5 font-roboto text-[13px] text-tinta/70"
                      numberOfLines={1}>
                      {cliente.email}
                    </Text>
                  ) : null}
                  <AccionesAdmin>
                    <EnlaceAdmin etiqueta="VER" onPress={() => tab.setDetalle(cliente)} />
                    <EnlaceAdmin etiqueta="EDITAR" onPress={() => tab.abrir(cliente)} />
                    <EnlaceAdmin etiqueta="ELIMINAR" peligro onPress={() => onEliminar(cliente)} />
                  </AccionesAdmin>
                </CeldaTabla>
                <CeldaTabla ancho={68} derecha>
                  <Text className="text-right font-roboto text-sm text-tinta">
                    {cliente.totalOrders ?? 0}
                  </Text>
                </CeldaTabla>
                <CeldaTabla ancho={72} derecha>
                  <Text className="text-right font-roboto text-sm text-tinta">
                    {cliente.totalReservations ?? 0}
                  </Text>
                </CeldaTabla>
              </FilaTabla>
            ))}
          </View>
        ) : (
          <GrillaAdmin>
            {tab.lista.map((cliente) => (
              <CajaCuadricula key={cliente.id}>
                <View className="mb-2 h-10 w-10 items-center justify-center border border-oro/40">
                  <Text className="font-roboto text-sm text-marca">{iniciales(cliente.name)}</Text>
                </View>
                <Text className="font-roboto-light text-base text-tinta" numberOfLines={2}>
                  {cliente.name}
                </Text>
                {cliente.email ? (
                  <Text className="mt-1 font-roboto text-[13px] text-tinta/70" numberOfLines={1}>
                    {cliente.email}
                  </Text>
                ) : null}
                <Text className="mt-2 font-roboto text-sm text-tinta/70">
                  {cliente.totalOrders ?? 0} pedidos · {cliente.totalReservations ?? 0} reservas
                </Text>
                {cliente.totalSpent ? (
                  <Text className="mt-1 font-roboto text-sm text-marca">
                    {formatCOP(cliente.totalSpent)}
                  </Text>
                ) : null}
                <AccionesAdmin>
                  <EnlaceAdmin etiqueta="VER" onPress={() => tab.setDetalle(cliente)} />
                  <EnlaceAdmin etiqueta="EDITAR" onPress={() => tab.abrir(cliente)} />
                  <EnlaceAdmin etiqueta="ELIMINAR" peligro onPress={() => onEliminar(cliente)} />
                </AccionesAdmin>
              </CajaCuadricula>
            ))}
          </GrillaAdmin>
        )}
      </TarjetaPerfil>

      <ModalAdmin
        visible={tab.abierto}
        titulo={tab.editando ? 'Editar cliente' : 'Nuevo cliente'}
        onCerrar={tab.cerrar}>
        <FormularioCliente
          key={tab.editando?.id ?? 'nuevo'}
          valores={tab.valoresFormulario}
          editando={Boolean(tab.editando)}
          onCancelar={tab.cerrar}
          onGuardar={tab.guardar}
          guardando={guardando}
        />
      </ModalAdmin>

      <ModalAdmin
        compacto
        visible={Boolean(tab.detalle)}
        titulo={tab.detalle?.name || 'Cliente'}
        onCerrar={() => tab.setDetalle(null)}>
        {tab.detalle ? (
          <View>
            <View className="gap-1">
              <Text className="font-roboto text-[14px] text-tinta/70">
                {tab.detalle.email || 'Sin correo'}
              </Text>
              <Text className="font-roboto text-[14px] text-tinta/70">
                {tab.detalle.phone || 'Sin teléfono'}
              </Text>
              <Text className="font-roboto text-[13px] text-tinta/55">
                Nacimiento: {tab.detalle.birthDate || 'Sin fecha'}
              </Text>
              <Text className="font-roboto text-[13px] text-tinta/55">
                Cumpleaños:{' '}
                {tab.detalle.birthdayEligible
                  ? 'Beneficio activo esta semana'
                  : tab.detalle.birthdayInWindow
                    ? 'Ya usado este año'
                    : 'Fuera de la semana de cumpleaños'}
              </Text>
            </View>
            <View className="my-4 h-px bg-madera/20" />
            <View className="flex-row gap-6">
              <View>
                <Text className="font-roboto text-[12px] tracking-[2px] text-marca">PEDIDOS</Text>
                <Text className="mt-1 font-serif-light text-[24px] text-tinta">
                  {tab.detalle.totalOrders ?? 0}
                </Text>
              </View>
              <View>
                <Text className="font-roboto text-[12px] tracking-[2px] text-marca">RESERVAS</Text>
                <Text className="mt-1 font-serif-light text-[24px] text-tinta">
                  {tab.detalle.totalReservations ?? 0}
                </Text>
              </View>
            </View>
            {tab.detalle.totalSpent ? (
              <View className="mt-4 flex-row items-baseline justify-between border-t border-madera/20 pt-3">
                <Text className="font-roboto text-[12px] tracking-[2px] text-marca">GASTADO</Text>
                <Text className="font-serif-light text-[24px] text-marca">
                  {formatCOP(tab.detalle.totalSpent)}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </ModalAdmin>
    </View>
  );
}
