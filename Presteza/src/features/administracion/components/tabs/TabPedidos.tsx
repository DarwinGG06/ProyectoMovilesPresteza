import { Text, View } from 'react-native';

import { TarjetaPerfil } from '@/features/perfil/components/TarjetaPerfil';
import { formatCOP } from '@/services/cart/CartContext';

import { FILTROS_PEDIDOS, useTabPedidos } from '../../hooks/useTabPedidos';
import type { ClienteAdmin, PedidoAdmin, PedidoForm, ProductoAdmin } from '../../types';
import { formatoFechaHora, idDe, textoEstadoPedido } from '../../utils';
import { AccionesAdmin, ChipFiltro, EnlaceAdmin, EstadoVacioAdmin, ModalAdmin } from '../elementos';
import { FormularioPedido } from '../formularios/FormularioPedido';
import {
  CajaCuadricula,
  CeldaTabla,
  EncabezadoTabla,
  FilaFiltros,
  FilaTabla,
  GrillaAdmin,
  InterruptorVista,
} from '../VistaCarta';

const ESTADOS = [
  { id: 'pending', etiqueta: 'PENDIENTE' },
  { id: 'preparing', etiqueta: 'PREPARANDO' },
  { id: 'ready', etiqueta: 'LISTO' },
  { id: 'delivered', etiqueta: 'ENTREGADO' },
  { id: 'cancelled', etiqueta: 'CANCELAR' },
] as const;

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

  const acciones = (pedido: PedidoAdmin) => (
    <AccionesAdmin>
      <EnlaceAdmin etiqueta="VER" onPress={() => tab.verDetalle(pedido)} />
      <EnlaceAdmin etiqueta="EDITAR" onPress={() => tab.abrir(pedido)} />
      {ESTADOS.map((estado) => (
        <EnlaceAdmin
          key={estado.id}
          etiqueta={estado.etiqueta}
          peligro={estado.id === 'cancelled'}
          onPress={() => onCambiarEstado(pedido, estado.id)}
        />
      ))}
      <EnlaceAdmin etiqueta="ELIMINAR" peligro onPress={() => onEliminar(pedido)} />
    </AccionesAdmin>
  );

  return (
    <View>
      <TarjetaPerfil
        numero="I"
        badge="COMANDA"
        titulo="Pedidos"
        accion={{ etiqueta: 'AGREGAR', onPress: () => tab.abrir() }}>
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
            <EncabezadoTabla
              columnas={[
                { texto: 'PEDIDO', flex: 1.2 },
                { texto: 'CLIENTE', flex: 0.9 },
                { texto: 'TOTAL', ancho: 82, derecha: true },
              ]}
            />
            {tab.lista.map((pedido) => (
              <FilaTabla key={idDe(pedido)}>
                <CeldaTabla flex={1.2}>
                  <Text className="font-roboto-light text-sm text-white">
                    #{idDe(pedido).slice(-8).toUpperCase()}
                  </Text>
                  <Text className="mt-0.5 font-roboto text-[10px] tracking-[1px] text-oro">
                    {textoEstadoPedido(pedido.status).toUpperCase()}
                  </Text>
                  {acciones(pedido)}
                </CeldaTabla>
                <CeldaTabla flex={0.9}>
                  <Text className="font-roboto text-sm text-crema/70" numberOfLines={1}>
                    {pedido.user_name || 'Cliente'}
                  </Text>
                  <Text className="mt-0.5 font-roboto text-[11px] text-crema/40" numberOfLines={1}>
                    {formatoFechaHora(pedido.createdAt)}
                  </Text>
                </CeldaTabla>
                <CeldaTabla ancho={82} derecha>
                  <Text className="text-right font-roboto text-sm text-oro">
                    {formatCOP(pedido.total || 0)}
                  </Text>
                </CeldaTabla>
              </FilaTabla>
            ))}
          </View>
        ) : (
          <GrillaAdmin>
            {tab.lista.map((pedido) => (
              <CajaCuadricula key={idDe(pedido)}>
                <Text className="font-roboto text-[10px] tracking-[1px] text-oro">
                  {textoEstadoPedido(pedido.status).toUpperCase()}
                </Text>
                <Text className="mt-1 font-roboto-light text-base text-white">
                  #{idDe(pedido).slice(-8).toUpperCase()}
                </Text>
                <Text className="mt-1 font-roboto text-sm text-crema/55" numberOfLines={1}>
                  {pedido.user_name || 'Cliente'}
                </Text>
                <Text className="mt-1 font-roboto text-[11px] text-crema/40">
                  {formatoFechaHora(pedido.createdAt)}
                </Text>
                <Text className="mt-2 font-roboto text-lg text-oro">
                  {formatCOP(pedido.total || 0)}
                </Text>
                {acciones(pedido)}
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
          onCancelar={tab.cerrar}
          onGuardar={tab.guardar}
          guardando={guardando}
        />
      </ModalAdmin>

      <ModalAdmin
        visible={Boolean(tab.detalle)}
        titulo={tab.detalle ? `#${idDe(tab.detalle).slice(-8).toUpperCase()}` : 'Pedido'}
        onCerrar={tab.cerrarDetalle}>
        {tab.detalle ? (
          <View className="gap-3">
            <Text className="font-roboto text-sm text-texto/70">
              {tab.detalle.user_name || 'Cliente'}
            </Text>
            <Text className="font-roboto text-sm text-texto/55">
              {textoEstadoPedido(tab.detalle.status)}
            </Text>
            <Text className="font-roboto text-sm text-texto/55">
              {formatoFechaHora(tab.detalle.createdAt)}
            </Text>
            {(tab.detalle.products ?? []).map((producto, index) => (
              <Text
                key={`${producto.dishId}-${index}`}
                className="font-roboto text-base text-marca-oscura">
                {producto.quantity} × {producto.name}
              </Text>
            ))}
            <Text className="font-roboto text-lg text-marca">
              {formatCOP(tab.detalle.total || 0)}
            </Text>
            <AccionesAdmin>
              <EnlaceAdmin etiqueta="EDITAR" onPress={tab.editarDesdeDetalle} />
              <EnlaceAdmin
                etiqueta="ELIMINAR"
                peligro
                onPress={() => tab.detalle && onEliminar(tab.detalle)}
              />
            </AccionesAdmin>
          </View>
        ) : null}
      </ModalAdmin>
    </View>
  );
}
