import { useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

import { TarjetaPerfil } from '@/features/perfil/components/TarjetaPerfil';
import { formatCOP } from '@/services/cart/CartContext';

import { FILTROS_PEDIDOS, useTabPedidos } from '../../hooks/useTabPedidos';
import type { ClienteAdmin, PedidoAdmin, PedidoForm, ProductoAdmin } from '../../types';
import { formatoFechaHora, idDe, siguientesEstadosPedido, textoEstadoPedido } from '../../utils';
import {
  AccionesAdmin,
  BotonAgregarAdmin,
  ChipFiltro,
  EnlaceAdmin,
  EstadoVacioAdmin,
  ModalAdmin,
} from '../elementos';
import { FormularioPedido } from '../formularios/FormularioPedido';
import {
  CajaCuadricula,
  FilaFiltros,
  FilaTabla,
  GrillaAdmin,
  InterruptorVista,
} from '../VistaCarta';

type TabPedidosProps = {
  pedidos: PedidoAdmin[];
  clientes: ClienteAdmin[];
  productos: ProductoAdmin[];
  guardando?: boolean;
  onGuardar: (datos: PedidoForm, editando?: PedidoAdmin | null) => Promise<boolean>;
  onCambiarEstado: (pedido: PedidoAdmin, status: string) => void;
  onEliminar: (pedido: PedidoAdmin) => void;
};

export function TabPedidos({
  pedidos,
  clientes,
  productos,
  guardando,
  onGuardar,
  onCambiarEstado,
  onEliminar,
}: TabPedidosProps) {
  const tab = useTabPedidos(pedidos, clientes, onGuardar);
  const { detalle, setFiltro } = tab;
  const params = useLocalSearchParams<{ filtro?: string }>();

  useEffect(() => {
    if (params.filtro === 'pending') setFiltro('pending');
  }, [params.filtro, setFiltro]);

  const accionesFila = (pedido: PedidoAdmin) => (
    <AccionesAdmin>
      <EnlaceAdmin etiqueta="VER" onPress={() => tab.verDetalle(pedido)} />
      <EnlaceAdmin etiqueta="EDITAR" onPress={() => tab.abrir(pedido)} />
      <EnlaceAdmin etiqueta="ELIMINAR" peligro onPress={() => onEliminar(pedido)} />
    </AccionesAdmin>
  );

  return (
    <View>
      <TarjetaPerfil compacto numero="I" badge="COMANDA" titulo="Pedidos">
        <BotonAgregarAdmin onPress={() => tab.abrir()} />
        <InterruptorVista
          vista={tab.vista}
          onChange={tab.setVista}
          filtrosAbiertos={tab.filtrosAbiertos}
          onFiltros={() => tab.setFiltrosAbiertos((abierto) => !abierto)}
        />
        {tab.filtrosAbiertos ? (
          <FilaFiltros>
            {FILTROS_PEDIDOS.map((item) => (
              <ChipFiltro
                key={item.id}
                etiqueta={item.etiqueta}
                activo={tab.filtro === item.id}
                onPress={() => tab.setFiltro(item.id)}
              />
            ))}
          </FilaFiltros>
        ) : null}

        {tab.lista.length === 0 ? (
          <EstadoVacioAdmin
            icono="receipt-outline"
            titulo="Sin pedidos"
            texto="Crea una comanda o espera a que lleguen."
          />
        ) : tab.vista === 'lista' ? (
          <View>
            {tab.lista.map((pedido) => (
              <FilaTabla key={idDe(pedido)} onPress={() => tab.verDetalle(pedido)}>
                <View className="flex-1">
                  <View className="flex-row items-start justify-between gap-2">
                    <View className="flex-1">
                      <Text className="font-roboto text-[10px] tracking-[1.4px] text-marca">
                        {textoEstadoPedido(pedido.status).toUpperCase()}
                      </Text>
                      <Text className="mt-1 font-serif text-[20px] text-tinta">
                        #{idDe(pedido).slice(-8).toUpperCase()}
                      </Text>
                      <Text className="mt-1 font-roboto text-sm text-tinta/60" numberOfLines={1}>
                        {pedido.user_name || 'Cliente'}
                      </Text>
                      <Text className="mt-0.5 font-roboto text-[11px] text-tinta/70">
                        {formatoFechaHora(pedido.createdAt)}
                      </Text>
                    </View>
                    <Text className="font-roboto text-base text-marca">
                      {formatCOP(pedido.total || 0)}
                    </Text>
                  </View>
                  {accionesFila(pedido)}
                </View>
              </FilaTabla>
            ))}
          </View>
        ) : (
          <GrillaAdmin>
            {tab.lista.map((pedido) => (
              <CajaCuadricula key={idDe(pedido)}>
                <Text className="font-roboto text-[10px] tracking-[1px] text-marca">
                  {textoEstadoPedido(pedido.status).toUpperCase()}
                </Text>
                <Text className="mt-1 font-serif text-[18px] text-tinta">
                  #{idDe(pedido).slice(-8).toUpperCase()}
                </Text>
                <Text className="mt-1 font-roboto text-sm text-tinta/55" numberOfLines={1}>
                  {pedido.user_name || 'Cliente'}
                </Text>
                <Text className="mt-1 font-roboto text-[11px] text-tinta/70">
                  {formatoFechaHora(pedido.createdAt)}
                </Text>
                <Text className="mt-2 font-roboto text-lg text-marca">
                  {formatCOP(pedido.total || 0)}
                </Text>
                {accionesFila(pedido)}
              </CajaCuadricula>
            ))}
          </GrillaAdmin>
        )}
      </TarjetaPerfil>

      <ModalAdmin
        visible={tab.abierto}
        titulo={tab.editando ? 'Editar pedido' : 'Nuevo pedido'}
        onCerrar={tab.cerrar}>
        <FormularioPedido
          key={tab.editando ? idDe(tab.editando) : 'nuevo'}
          valores={tab.valoresFormulario}
          clientes={clientes}
          productos={productos}
          bloquearCliente={Boolean(tab.editando)}
          onCancelar={tab.cerrar}
          onGuardar={tab.guardar}
          guardando={guardando}
        />
      </ModalAdmin>

      <ModalAdmin
        visible={Boolean(detalle)}
        titulo={detalle ? `#${idDe(detalle).slice(-8).toUpperCase()}` : 'Pedido'}
        onCerrar={tab.cerrarDetalle}>
        {detalle ? (
          <View className="gap-3">
            <Text className="font-roboto text-sm text-tinta/70">
              {detalle.user_name || 'Cliente'}
            </Text>
            <Text className="font-roboto text-sm text-tinta/55">
              {formatoFechaHora(detalle.createdAt)}
            </Text>
            {(detalle.products ?? []).map((producto, index) => (
              <Text
                key={`${producto.dishId}-${index}`}
                className="font-roboto text-base text-tinta">
                {producto.quantity} × {producto.name}
              </Text>
            ))}
            <Text className="font-roboto text-lg text-marca">{formatCOP(detalle.total || 0)}</Text>

            <Text className="mt-2 font-roboto text-[10px] tracking-[2px] text-marca">ESTADO</Text>
            <Text className="font-roboto text-sm text-tinta">
              {textoEstadoPedido(detalle.status)}
            </Text>
            <AccionesAdmin>
              {siguientesEstadosPedido(detalle.status).map((estado) => (
                <EnlaceAdmin
                  key={estado.id}
                  etiqueta={estado.etiqueta}
                  peligro={estado.peligro}
                  onPress={() => {
                    onCambiarEstado(detalle, estado.id);
                    tab.cerrarDetalle();
                  }}
                />
              ))}
            </AccionesAdmin>

            <AccionesAdmin>
              <EnlaceAdmin etiqueta="EDITAR" onPress={tab.editarDesdeDetalle} />
              <EnlaceAdmin etiqueta="ELIMINAR" peligro onPress={() => onEliminar(detalle)} />
            </AccionesAdmin>
          </View>
        ) : null}
      </ModalAdmin>
    </View>
  );
}
