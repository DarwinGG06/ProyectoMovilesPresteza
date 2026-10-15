import { Text, View } from 'react-native';

import CampoBusqueda from '@/components/CampoBusqueda';
import { TarjetaPerfil } from '@/features/perfil/components/TarjetaPerfil';
import { formatCOP } from '@/services/cart/CartContext';

import { useTabClientes } from '../../hooks/useTabClientes';
import type { ClienteAdmin, ClienteForm } from '../../types';
import { iniciales } from '../../utils';
import { AccionesAdmin, ChipFiltro, EnlaceAdmin, EstadoVacioAdmin, ModalAdmin } from '../elementos';
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
      <TarjetaPerfil
        numero="I"
        badge="MESA"
        titulo="Clientes"
        accion={{ etiqueta: 'AGREGAR', onPress: () => tab.abrir() }}>
        <CampoBusqueda
          value={tab.busqueda}
          onChangeText={tab.setBusqueda}
          placeholder="Buscar cliente..."
          variant="oscuro"
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
                  <Text className="font-roboto-light text-sm text-white" numberOfLines={1}>
                    {cliente.name}
                  </Text>
                  {cliente.email ? (
                    <Text
                      className="mt-0.5 font-roboto text-[11px] text-crema/45"
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
                  <Text className="text-right font-roboto text-sm text-crema">
                    {cliente.totalOrders ?? 0}
                  </Text>
                </CeldaTabla>
                <CeldaTabla ancho={72} derecha>
                  <Text className="text-right font-roboto text-sm text-crema">
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
                  <Text className="font-roboto text-sm text-oro">{iniciales(cliente.name)}</Text>
                </View>
                <Text className="font-roboto-light text-base text-white" numberOfLines={2}>
                  {cliente.name}
                </Text>
                {cliente.email ? (
                  <Text className="mt-1 font-roboto text-[11px] text-crema/50" numberOfLines={1}>
                    {cliente.email}
                  </Text>
                ) : null}
                <Text className="mt-2 font-roboto text-sm text-crema/65">
                  {cliente.totalOrders ?? 0} pedidos · {cliente.totalReservations ?? 0} reservas
                </Text>
                {cliente.totalSpent ? (
                  <Text className="mt-1 font-roboto text-sm text-oro">
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
        visible={Boolean(tab.detalle)}
        titulo={tab.detalle?.name || 'Cliente'}
        onCerrar={() => tab.setDetalle(null)}>
        {tab.detalle ? (
          <View className="gap-3">
            <Text className="font-roboto text-sm text-texto/70">
              {tab.detalle.email || 'Sin correo'}
            </Text>
            <Text className="font-roboto text-sm text-texto/70">
              {tab.detalle.phone || 'Sin teléfono'}
            </Text>
            <Text className="font-roboto text-base text-marca-oscura">
              {tab.detalle.totalOrders ?? 0} pedidos
            </Text>
            <Text className="font-roboto text-base text-marca-oscura">
              {tab.detalle.totalReservations ?? 0} reservas
            </Text>
            {tab.detalle.totalSpent ? (
              <Text className="font-roboto text-lg text-marca">
                {formatCOP(tab.detalle.totalSpent)}
              </Text>
            ) : null}
          </View>
        ) : null}
      </ModalAdmin>
    </View>
  );
}
