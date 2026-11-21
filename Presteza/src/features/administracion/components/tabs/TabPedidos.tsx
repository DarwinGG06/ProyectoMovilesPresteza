import { useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import Button from '@/components/Button';
import { TarjetaPerfil } from '@/features/perfil/components/TarjetaPerfil';
import { formatCOP } from '@/services/cart/CartContext';

import { FILTROS_PEDIDOS, useTabPedidos } from '../../hooks/useTabPedidos';
import type { ClienteAdmin, PedidoAdmin, PedidoForm, ProductoAdmin } from '../../types';
import {
  formatoFechaHora,
  idDe,
  pedidoEditable,
  siguientesEstadosPedido,
  textoEntrega,
  textoEstadoPedido,
} from '../../utils';
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
      {pedidoEditable(pedido) ? (
        <EnlaceAdmin etiqueta="EDITAR" onPress={() => tab.abrir(pedido)} />
      ) : null}
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
                      <Text className="font-roboto text-[12px] tracking-[1.4px] text-marca">
                        {textoEstadoPedido(pedido.status).toUpperCase()}
                      </Text>
                      <Text className="mt-1 font-serif text-[20px] text-tinta">
                        #{idDe(pedido).slice(-8).toUpperCase()}
                      </Text>
                      <Text className="mt-1 font-roboto text-sm text-tinta/70" numberOfLines={1}>
                        {pedido.user_name || 'Cliente'}
                        {textoEntrega(pedido) ? ` · ${textoEntrega(pedido)}` : ''}
                      </Text>
                      <Text className="mt-0.5 font-roboto text-[13px] text-tinta/70">
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
                <Text className="font-roboto text-[12px] tracking-[1px] text-marca">
                  {textoEstadoPedido(pedido.status).toUpperCase()}
                </Text>
                <Text className="mt-1 font-serif text-[18px] text-tinta">
                  #{idDe(pedido).slice(-8).toUpperCase()}
                </Text>
                <Text className="mt-1 font-roboto text-sm text-tinta/70" numberOfLines={1}>
                  {pedido.user_name || 'Cliente'}
                </Text>
                <Text className="mt-1 font-roboto text-[13px] text-tinta/70">
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
        compacto
        visible={Boolean(detalle)}
        titulo={detalle ? `#${idDe(detalle).slice(-8).toUpperCase()}` : 'Pedido'}
        onCerrar={tab.cerrarDetalle}>
        {detalle ? (
          <View>
            <View className="self-start rounded-full bg-marca/10 px-3.5 py-1.5">
              <Text className="font-roboto text-[12px] tracking-[2px] text-marca">
                {textoEstadoPedido(detalle.status).toUpperCase()}
              </Text>
            </View>

            <View className="mt-4 gap-1">
              <Text className="font-roboto text-[15px] text-tinta">
                {detalle.user_name || 'Cliente'}
              </Text>
              {textoEntrega(detalle) ? (
                <Text className="font-roboto text-[13px] text-tinta/70">{textoEntrega(detalle)}</Text>
              ) : null}
              <Text className="font-roboto text-[13px] text-tinta/55">
                {formatoFechaHora(detalle.createdAt)}
              </Text>
            </View>

            <View className="my-4 h-px bg-madera/20" />

            <View className="gap-3">
              {(detalle.products ?? []).map((producto, index) => (
                <View key={`${producto.dishId}-${index}`}>
                  <View className="flex-row items-start justify-between gap-3">
                    <Text className="flex-1 font-roboto text-[15px] text-tinta">
                      <Text className="font-roboto text-marca">{producto.quantity} × </Text>
                      {producto.name}
                    </Text>
                    {producto.unit_price != null ? (
                      <Text className="font-roboto text-[14px] text-marca">
                        {formatCOP((producto.unit_price || 0) * (producto.quantity || 1))}
                      </Text>
                    ) : null}
                  </View>
                  {(producto.adds ?? []).length > 0 ? (
                    <View className="mt-1.5 gap-1 border-l border-oro/40 pl-3">
                      {(producto.adds ?? []).map((extra, i) => (
                        <View
                          key={`${extra.name}-${i}`}
                          className="flex-row items-baseline justify-between gap-2">
                          <Text className="flex-1 font-roboto text-[13px] text-tinta/70">
                            + {extra.name}
                          </Text>
                          {extra.price != null ? (
                            <Text className="font-roboto text-[12px] text-tinta/55">
                              {formatCOP(extra.price)}
                            </Text>
                          ) : null}
                        </View>
                      ))}
                    </View>
                  ) : null}
                </View>
              ))}
            </View>

            <View className="mt-4 flex-row items-baseline justify-between border-t border-madera/20 pt-3">
              <Text className="font-roboto text-[12px] tracking-[2px] text-marca">TOTAL</Text>
              <Text className="font-serif-light text-[26px] text-marca">
                {formatCOP(detalle.total || 0)}
              </Text>
            </View>

            {siguientesEstadosPedido(
              detalle.status,
              detalle.tipo === 'domicilio' || detalle.deliveryAddress ? 'domicilio' : detalle.tipo,
            ).map((estado) =>
              estado.peligro ? (
                <Pressable
                  key={estado.id}
                  onPress={() => {
                    onCambiarEstado(detalle, estado.id);
                    tab.cerrarDetalle();
                  }}
                  accessibilityRole="button"
                  className="mt-4 min-h-12 items-center justify-center border border-red-600/45">
                  <Text className="font-roboto text-[13px] tracking-[2px] text-red-700">
                    {estado.etiqueta}
                  </Text>
                </Pressable>
              ) : (
                <Button
                  key={estado.id}
                  text={estado.etiqueta}
                  variant="gold"
                  compact
                  className="mt-4 w-full"
                  onPress={() => {
                    onCambiarEstado(detalle, estado.id);
                    tab.cerrarDetalle();
                  }}
                />
              ),
            )}

            {pedidoEditable(detalle) ? null : (
              <Text className="mt-3 font-roboto text-[13px] text-tinta/55">
                Pedido entregado: solo se puede ver.
              </Text>
            )}

            <View className="mt-3 flex-row gap-2">
              {pedidoEditable(detalle) ? (
                <Button
                  text="EDITAR"
                  variant="secondary"
                  compact
                  className="flex-1"
                  onPress={tab.editarDesdeDetalle}
                />
              ) : null}
              <Pressable
                onPress={() => onEliminar(detalle)}
                accessibilityRole="button"
                className="min-h-12 flex-1 items-center justify-center border border-red-600/45">
                <Text className="font-roboto text-[13px] tracking-[2px] text-red-700">ELIMINAR</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </ModalAdmin>
    </View>
  );
}
