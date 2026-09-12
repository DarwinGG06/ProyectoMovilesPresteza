import { useEffect, useMemo, useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { TarjetaPerfil } from '@/features/perfil/components/TarjetaPerfil';
import { formatCOP } from '@/services/cart/CartContext';

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
  onGuardar: (datos: ClienteForm) => Promise<boolean>;
  onEliminar: (cliente: ClienteAdmin) => void;
};

export function TabClientes({ clientes, guardando, onGuardar, onEliminar }: TabClientesProps) {
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<'all' | 'pedidos' | 'reservas'>('all');
  const [vista, setVista] = useState<'lista' | 'cuadricula'>('lista');
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(true);
  const [creando, setCreando] = useState(false);
  const [detalle, setDetalle] = useState<ClienteAdmin | null>(null);

  const lista = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return clientes.filter((cliente) => {
      const coincideTexto =
        !texto ||
        [cliente.name, cliente.email, cliente.phone].filter(Boolean).some((campo) => campo!.toLowerCase().includes(texto));
      const coincideActividad =
        filtro === 'all' ||
        (filtro === 'pedidos' ? (cliente.totalOrders ?? 0) > 0 : (cliente.totalReservations ?? 0) > 0);
      return coincideTexto && coincideActividad;
    });
  }, [busqueda, clientes, filtro]);

  useEffect(() => {
    if (detalle && !clientes.some((item) => item.id === detalle.id)) setDetalle(null);
  }, [clientes, detalle]);

  const guardar = async (datos: ClienteForm) => {
    if (await onGuardar(datos)) setCreando(false);
  };

  return (
    <View>
      <TarjetaPerfil
        numero="I"
        badge="MESA"
        titulo="Clientes"
        accion={{ etiqueta: 'AGREGAR', onPress: () => setCreando(true) }}>
        <TextInput
          value={busqueda}
          onChangeText={setBusqueda}
          placeholder="Buscar cliente..."
          placeholderTextColor="#d4af7788"
          className="mb-4 border-b border-oro/30 py-3 text-crema"
        />
        <InterruptorVista
          vista={vista}
          onChange={setVista}
          filtrosAbiertos={filtrosAbiertos}
          onFiltros={() => setFiltrosAbiertos((prev) => !prev)}
        />
        {filtrosAbiertos ? (
          <FilaFiltros>
            <ChipFiltro etiqueta="TODOS" activo={filtro === 'all'} onPress={() => setFiltro('all')} />
            <ChipFiltro etiqueta="CON PEDIDOS" activo={filtro === 'pedidos'} onPress={() => setFiltro('pedidos')} />
            <ChipFiltro etiqueta="CON RESERVAS" activo={filtro === 'reservas'} onPress={() => setFiltro('reservas')} />
          </FilaFiltros>
        ) : null}
        {lista.length === 0 ? (
          <EstadoVacioAdmin icono="people-outline" titulo="Sin clientes" texto="Crea el primero o espera a que se registren." />
        ) : vista === 'lista' ? (
          <View>
            <EncabezadoTabla
              columnas={[
                { texto: 'CLIENTE', flex: 1.4 },
                { texto: 'PEDIDOS', ancho: 68, derecha: true },
                { texto: 'RESERVAS', ancho: 72, derecha: true },
              ]}
            />
            {lista.map((cliente) => (
              <FilaTabla key={cliente.id}>
                <CeldaTabla flex={1.4}>
                  <Text className="text-sm font-light text-white" numberOfLines={1}>
                    {cliente.name}
                  </Text>
                  {cliente.email ? (
                    <Text className="mt-0.5 text-[11px] text-crema/45" numberOfLines={1}>
                      {cliente.email}
                    </Text>
                  ) : null}
                  <AccionesAdmin>
                    <EnlaceAdmin etiqueta="VER" onPress={() => setDetalle(cliente)} />
                    <EnlaceAdmin etiqueta="ELIMINAR" peligro onPress={() => onEliminar(cliente)} />
                  </AccionesAdmin>
                </CeldaTabla>
                <CeldaTabla ancho={68} derecha>
                  <Text className="text-right text-sm text-crema">{cliente.totalOrders ?? 0}</Text>
                </CeldaTabla>
                <CeldaTabla ancho={72} derecha>
                  <Text className="text-right text-sm text-crema">{cliente.totalReservations ?? 0}</Text>
                </CeldaTabla>
              </FilaTabla>
            ))}
          </View>
        ) : (
          <GrillaAdmin>
            {lista.map((cliente) => (
              <CajaCuadricula key={cliente.id}>
                <View className="mb-2 h-10 w-10 items-center justify-center border border-oro/40">
                  <Text className="text-sm text-oro">{iniciales(cliente.name)}</Text>
                </View>
                <Text className="text-base font-light text-white" numberOfLines={2}>
                  {cliente.name}
                </Text>
                {cliente.email ? (
                  <Text className="mt-1 text-[11px] text-crema/50" numberOfLines={1}>
                    {cliente.email}
                  </Text>
                ) : null}
                <Text className="mt-2 text-sm text-crema/65">
                  {cliente.totalOrders ?? 0} pedidos · {cliente.totalReservations ?? 0} reservas
                </Text>
                {cliente.totalSpent ? (
                  <Text className="mt-1 text-sm text-oro">{formatCOP(cliente.totalSpent)}</Text>
                ) : null}
                <AccionesAdmin>
                  <EnlaceAdmin etiqueta="VER" onPress={() => setDetalle(cliente)} />
                  <EnlaceAdmin etiqueta="ELIMINAR" peligro onPress={() => onEliminar(cliente)} />
                </AccionesAdmin>
              </CajaCuadricula>
            ))}
          </GrillaAdmin>
        )}
      </TarjetaPerfil>

      <ModalAdmin visible={creando} titulo="Nuevo cliente" onCerrar={() => setCreando(false)}>
        <FormularioCliente
          valores={{ name: '', email: '', phone: '', password: '' }}
          onCancelar={() => setCreando(false)}
          onGuardar={guardar}
          guardando={guardando}
        />
      </ModalAdmin>

      <ModalAdmin visible={Boolean(detalle)} titulo={detalle?.name || 'Cliente'} onCerrar={() => setDetalle(null)}>
        {detalle ? (
          <View className="gap-3">
            <Text className="text-sm text-texto/70">{detalle.email || 'Sin correo'}</Text>
            <Text className="text-sm text-texto/70">{detalle.phone || 'Sin teléfono'}</Text>
            <Text className="text-base text-marca-oscura">{detalle.totalOrders ?? 0} pedidos</Text>
            <Text className="text-base text-marca-oscura">{detalle.totalReservations ?? 0} reservas</Text>
            {detalle.totalSpent ? <Text className="text-lg text-marca">{formatCOP(detalle.totalSpent)}</Text> : null}
          </View>
        ) : null}
      </ModalAdmin>
    </View>
  );
}
