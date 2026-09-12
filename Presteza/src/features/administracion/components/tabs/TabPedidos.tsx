import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { TarjetaPerfil } from '@/features/perfil/components/TarjetaPerfil';
import { formatCOP } from '@/services/cart/CartContext';
import { useAviso } from '@/shared/components/aviso';

import { actualizarEstadoPedido, actualizarPedido, crearPedido, eliminarPedido } from '../../api/adminApi';
import type { ClienteAdmin, PedidoAdmin, PedidoForm, ProductoAdmin } from '../../types';
import { estadoPedidoBackend, formatoFechaHora, idDe, textoEstadoPedido } from '../../utils';
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

const FILTROS = [
  { id: 'all', etiqueta: 'TODOS' },
  { id: 'pending', etiqueta: 'PENDIENTES' },
  { id: 'preparing', etiqueta: 'PREPARANDO' },
  { id: 'ready', etiqueta: 'LISTOS' },
  { id: 'delivered', etiqueta: 'ENTREGADOS' },
] as const;

const ESTADOS = [
  { id: 'pending', etiqueta: 'PENDIENTE' },
  { id: 'preparing', etiqueta: 'PREPARANDO' },
  { id: 'ready', etiqueta: 'LISTO' },
  { id: 'delivered', etiqueta: 'ENTREGADO' },
  { id: 'cancelled', etiqueta: 'CANCELAR' },
] as const;

type TabPedidosProps = {
  token: string;
  pedidos: PedidoAdmin[];
  setPedidos: (pedidos: PedidoAdmin[]) => void;
  clientes: ClienteAdmin[];
  productos: ProductoAdmin[];
};

function valoresDe(pedido?: PedidoAdmin, clienteId = ''): PedidoForm {
  return {
    userId: pedido?.userId || clienteId,
    payment_method: pedido?.payment_method || 'cash',
    status: estadoPedidoBackend(pedido?.status || 'pendiente'),
    lineas: (pedido?.products ?? []).map((producto) => ({
      dishId: producto.dishId || producto.name || '',
      name: producto.name || 'Plato',
      quantity: producto.quantity || 1,
      unit_price: producto.unit_price || 0,
      description: producto.name || 'Plato',
    })),
  };
}

export function TabPedidos({ token, pedidos, setPedidos, clientes, productos }: TabPedidosProps) {
  const [filtro, setFiltro] = useState<(typeof FILTROS)[number]['id']>('all');
  const [vista, setVista] = useState<'lista' | 'cuadricula'>('lista');
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(true);
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState<PedidoAdmin | null>(null);
  const [detalle, setDetalle] = useState<PedidoAdmin | null>(null);
  const [guardando, setGuardando] = useState(false);
  const aviso = useAviso();

  const lista = useMemo(() => {
    const ordenados = [...pedidos].sort(
      (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
    );
    if (filtro === 'all') return ordenados;
    return ordenados.filter((pedido) => {
      const estado = pedido.status;
      if (filtro === 'pending') return estado === 'pending' || estado === 'pendiente';
      if (filtro === 'preparing') return estado === 'preparing' || estado === 'en_proceso' || estado === 'Preparando';
      if (filtro === 'ready') return estado === 'ready' || estado === 'completado' || estado === 'listo';
      if (filtro === 'delivered') return estado === 'delivered' || estado === 'entregado';
      return true;
    });
  }, [filtro, pedidos]);

  const abrir = (pedido?: PedidoAdmin) => {
    setEditando(pedido ?? null);
    setAbierto(true);
  };

  const guardar = async (datos: PedidoForm) => {
    const cliente = clientes.find((item) => item.id === datos.userId);
    if (!cliente) {
      aviso.error('Pedido', 'Elige un cliente.');
      return;
    }
    if (!datos.lineas.length) {
      aviso.error('Pedido', 'Agrega al menos un plato.');
      return;
    }

    const cuerpo = {
      usuarioId: cliente.id,
      user_name: cliente.name,
      payment_method: datos.payment_method,
      status: estadoPedidoBackend(datos.status),
      products: datos.lineas.map((linea) => ({
        dishId: linea.dishId,
        name: linea.name,
        quantity: linea.quantity,
        unit_price: linea.unit_price,
        description: linea.description || linea.name,
      })),
      total: datos.lineas.reduce((suma, linea) => suma + linea.unit_price * linea.quantity, 0),
    };

    setGuardando(true);
    try {
      if (editando) {
        const actualizado = await actualizarPedido(token, idDe(editando), cuerpo);
        setPedidos(pedidos.map((item) => (idDe(item) === idDe(editando) ? { ...item, ...actualizado, ...cuerpo, userId: cliente.id } : item)));
        aviso.ok('Pedido editado', `El pedido de ${cliente.name} fue editado.`);
      } else {
        const creado = await crearPedido(token, cuerpo);
        setPedidos([{ ...creado, ...cuerpo, userId: cliente.id }, ...pedidos]);
        aviso.ok('Pedido creado', `El pedido de ${cliente.name} fue creado.`);
      }
      setAbierto(false);
    } catch (err) {
      aviso.errorDe(err, 'No se pudo guardar.', 'Pedido');
    } finally {
      setGuardando(false);
    }
  };

  const cambiar = (pedido: PedidoAdmin, status: string) => {
    const id = idDe(pedido);
    const codigo = id.slice(-8).toUpperCase();
    const estadoNuevo = textoEstadoPedido(status);
    const estadoActual = textoEstadoPedido(pedido.status);
    const esCancelar = status === 'cancelled';

    if (estadoPedidoBackend(pedido.status) === estadoPedidoBackend(status)) {
      aviso.ok('Pedido', `El pedido #${codigo} ya está ${estadoNuevo.toLowerCase()}.`);
      return;
    }

    aviso.confirmar({
      sello: 'PEDIDOS',
      titulo: esCancelar ? 'Cancelar pedido' : 'Cambiar estado',
      texto: esCancelar
        ? `¿Quieres cancelar el pedido #${codigo}?`
        : `¿Cambiar el pedido #${codigo} de ${estadoActual.toLowerCase()} a ${estadoNuevo.toLowerCase()}?`,
      confirmar: esCancelar ? 'CANCELAR PEDIDO' : 'CAMBIAR',
      peligro: esCancelar,
      exito: {
        titulo: esCancelar ? 'Pedido cancelado' : 'Estado cambiado',
        texto: esCancelar
          ? `El pedido #${codigo} fue cancelado.`
          : `El pedido #${codigo} cambió a ${estadoNuevo.toLowerCase()}.`,
      },
      onConfirmar: async () => {
        await actualizarEstadoPedido(token, id, status);
        setPedidos(pedidos.map((item) => (idDe(item) === id ? { ...item, status } : item)));
      },
    });
  };

  const borrar = (pedido: PedidoAdmin) => {
    const codigo = idDe(pedido).slice(-8).toUpperCase();
    aviso.confirmar({
      sello: 'PEDIDOS',
      titulo: 'Eliminar pedido',
      texto: `¿Borrar el pedido #${codigo}?`,
      confirmar: 'ELIMINAR',
      peligro: true,
      exito: {
        titulo: 'Pedido eliminado',
        texto: `El pedido #${codigo} fue eliminado.`,
      },
      onConfirmar: async () => {
        await eliminarPedido(token, idDe(pedido));
        setPedidos(pedidos.filter((item) => idDe(item) !== idDe(pedido)));
        if (detalle && idDe(detalle) === idDe(pedido)) setDetalle(null);
      },
    });
  };

  const acciones = (pedido: PedidoAdmin) => (
    <AccionesAdmin>
      <EnlaceAdmin etiqueta="VER" onPress={() => setDetalle(pedido)} />
      <EnlaceAdmin etiqueta="EDITAR" onPress={() => abrir(pedido)} />
      {ESTADOS.map((estado) => (
        <EnlaceAdmin
          key={estado.id}
          etiqueta={estado.etiqueta}
          peligro={estado.id === 'cancelled'}
          onPress={() => cambiar(pedido, estado.id)}
        />
      ))}
      <EnlaceAdmin etiqueta="ELIMINAR" peligro onPress={() => borrar(pedido)} />
    </AccionesAdmin>
  );

  return (
    <View>
      <TarjetaPerfil
        numero="I"
        badge="COMANDA"
        titulo="Pedidos"
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
          <EstadoVacioAdmin icono="receipt-outline" titulo="Sin pedidos" texto="Crea una comanda o espera a que lleguen." />
        ) : vista === 'lista' ? (
          <View>
            <EncabezadoTabla
              columnas={[
                { texto: 'PEDIDO', flex: 1.2 },
                { texto: 'CLIENTE', flex: 0.9 },
                { texto: 'TOTAL', ancho: 82, derecha: true },
              ]}
            />
            {lista.map((pedido) => (
              <FilaTabla key={idDe(pedido)}>
                <CeldaTabla flex={1.2}>
                  <Text className="text-sm font-light text-white">#{idDe(pedido).slice(-8).toUpperCase()}</Text>
                  <Text className="mt-0.5 text-[10px] tracking-[1px] text-oro">
                    {textoEstadoPedido(pedido.status).toUpperCase()}
                  </Text>
                  {acciones(pedido)}
                </CeldaTabla>
                <CeldaTabla flex={0.9}>
                  <Text className="text-sm text-crema/70" numberOfLines={1}>
                    {pedido.user_name || 'Cliente'}
                  </Text>
                  <Text className="mt-0.5 text-[11px] text-crema/40" numberOfLines={1}>
                    {formatoFechaHora(pedido.createdAt)}
                  </Text>
                </CeldaTabla>
                <CeldaTabla ancho={82} derecha>
                  <Text className="text-right text-sm text-oro">{formatCOP(pedido.total || 0)}</Text>
                </CeldaTabla>
              </FilaTabla>
            ))}
          </View>
        ) : (
          <GrillaAdmin>
            {lista.map((pedido) => (
              <CajaCuadricula key={idDe(pedido)}>
                <Text className="text-[10px] tracking-[1px] text-oro">{textoEstadoPedido(pedido.status).toUpperCase()}</Text>
                <Text className="mt-1 text-base font-light text-white">#{idDe(pedido).slice(-8).toUpperCase()}</Text>
                <Text className="mt-1 text-sm text-crema/55" numberOfLines={1}>
                  {pedido.user_name || 'Cliente'}
                </Text>
                <Text className="mt-1 text-[11px] text-crema/40">{formatoFechaHora(pedido.createdAt)}</Text>
                <Text className="mt-2 text-lg text-oro">{formatCOP(pedido.total || 0)}</Text>
                {acciones(pedido)}
              </CajaCuadricula>
            ))}
          </GrillaAdmin>
        )}
      </TarjetaPerfil>

      <ModalAdmin visible={abierto} titulo={editando ? 'Editar pedido' : 'Nuevo pedido'} onCerrar={() => setAbierto(false)}>
        <FormularioPedido
          key={editando ? idDe(editando) : 'nuevo'}
          valores={valoresDe(editando ?? undefined, clientes[0]?.id ?? '')}
          clientes={clientes}
          productos={productos}
          onCancelar={() => setAbierto(false)}
          onGuardar={guardar}
          guardando={guardando}
        />
      </ModalAdmin>

      <ModalAdmin visible={Boolean(detalle)} titulo={detalle ? `#${idDe(detalle).slice(-8).toUpperCase()}` : 'Pedido'} onCerrar={() => setDetalle(null)}>
        {detalle ? (
          <View className="gap-3">
            <Text className="text-sm text-texto/70">{detalle.user_name || 'Cliente'}</Text>
            <Text className="text-sm text-texto/55">{textoEstadoPedido(detalle.status)}</Text>
            <Text className="text-sm text-texto/55">{formatoFechaHora(detalle.createdAt)}</Text>
            {(detalle.products ?? []).map((producto, index) => (
              <Text key={`${producto.dishId}-${index}`} className="text-base text-marca-oscura">
                {producto.quantity} × {producto.name}
              </Text>
            ))}
            <Text className="text-lg text-marca">{formatCOP(detalle.total || 0)}</Text>
            <AccionesAdmin>
              <EnlaceAdmin etiqueta="EDITAR" onPress={() => { setDetalle(null); abrir(detalle); }} />
              <EnlaceAdmin etiqueta="ELIMINAR" peligro onPress={() => borrar(detalle)} />
            </AccionesAdmin>
          </View>
        ) : null}
      </ModalAdmin>
    </View>
  );
}
