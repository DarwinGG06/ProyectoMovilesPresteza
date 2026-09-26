import { router } from 'expo-router';
import { useCallback, useEffect, useMemo } from 'react';

import { useReservas } from '@/features/reservas/hooks/useReservas';

import type { PedidoAdmin, PedidoForm } from '../types';
import { calcularStats, enriquecerClientes, idDe } from '../utils';
import { useSesionAdmin } from './adminComun';
import { useAdminAdicionales } from './useAdminAdicionales';
import { useAdminAjustes } from './useAdminAjustes';
import { useAdminCategorias } from './useAdminCategorias';
import { useAdminClientes } from './useAdminClientes';
import { useAdminInsumos } from './useAdminInsumos';
import { useAdminMensajes } from './useAdminMensajes';
import { useAdminPedidos } from './useAdminPedidos';
import { useAdminProductos } from './useAdminProductos';

export function useAdmin() {
  const { user, token, isAuthenticated } = useSesionAdmin();
  const productos = useAdminProductos();
  const categorias = useAdminCategorias();
  const insumos = useAdminInsumos();
  const adicionales = useAdminAdicionales();
  const pedidos = useAdminPedidos();
  const mensajes = useAdminMensajes();
  const usuarios = useAdminClientes();
  const reservas = useReservas({ alcance: 'todas' });
  const ajustes = useAdminAjustes();

  const clientes = useMemo(
    () => enriquecerClientes(usuarios.usuarios, pedidos.pedidos, reservas.reservas),
    [pedidos.pedidos, reservas.reservas, usuarios.usuarios],
  );

  const stats = useMemo(
    () =>
      calcularStats({
        pedidos: pedidos.pedidos,
        productos: productos.productos,
        reservas: reservas.reservas,
        mensajes: mensajes.mensajes,
        clientes,
        categorias: categorias.categorias,
        insumos: insumos.insumos,
        adicionales: adicionales.adicionales,
      }),
    [
      adicionales.adicionales,
      categorias.categorias,
      clientes,
      insumos.insumos,
      mensajes.mensajes,
      pedidos.pedidos,
      productos.productos,
      reservas.reservas,
    ],
  );

  useEffect(() => {
    if (isAuthenticated && user && user.role !== 'admin') {
      router.replace('/perfil');
    }
  }, [isAuthenticated, user]);

  const recargar = useCallback(async () => {
    await Promise.all([
      productos.recargar(),
      categorias.recargar(),
      insumos.recargar(),
      adicionales.recargar(),
      pedidos.recargar(),
      mensajes.recargar(),
      usuarios.recargar(),
      reservas.recargar(),
    ]);
  }, [
    adicionales.recargar,
    categorias.recargar,
    insumos.recargar,
    mensajes.recargar,
    pedidos.recargar,
    productos.recargar,
    reservas.recargar,
    usuarios.recargar,
  ]);

  const guardarPedido = useCallback(
    (datos: PedidoForm, editando?: PedidoAdmin | null) => pedidos.guardar(datos, editando, clientes),
    [clientes, pedidos.guardar],
  );

  const error =
    [
      productos.error,
      categorias.error,
      insumos.error,
      adicionales.error,
      pedidos.error,
      mensajes.error,
      usuarios.error,
      reservas.error,
    ]
      .filter(Boolean)
      .join(' ') || null;

  return {
    user,
    token,
    isAuthenticated,
    esAdmin: user?.role === 'admin',
    salir: ajustes.salir,
    cargando:
      productos.cargando &&
      categorias.cargando &&
      insumos.cargando &&
      adicionales.cargando &&
      pedidos.cargando &&
      mensajes.cargando &&
      usuarios.cargando &&
      reservas.cargando,
    guardando:
      productos.guardando ||
      categorias.guardando ||
      insumos.guardando ||
      adicionales.guardando ||
      pedidos.guardando ||
      mensajes.guardando ||
      usuarios.guardando ||
      reservas.guardando ||
      ajustes.guardando,
    error,
    recargar,
    stats,
    idDe,
    pedidos: pedidos.pedidos,
    reservas: reservas.reservas,
    casaReservas: reservas,
    productos: productos.productos,
    categorias: categorias.categorias,
    insumos: insumos.insumos,
    adicionales: adicionales.adicionales,
    mensajes: mensajes.mensajes,
    clientes,
    guardarProducto: productos.guardar,
    alternarProducto: productos.alternar,
    eliminarProducto: productos.eliminar,
    guardarCategoria: categorias.guardar,
    eliminarCategoria: categorias.eliminar,
    guardarInsumo: insumos.guardar,
    eliminarInsumo: insumos.eliminar,
    guardarAdicional: adicionales.guardar,
    alternarAdicional: adicionales.alternar,
    eliminarAdicional: adicionales.eliminar,
    guardarPedido,
    cambiarEstadoPedido: pedidos.cambiarEstado,
    eliminarPedido: pedidos.eliminar,
    guardarMensaje: mensajes.guardar,
    eliminarMensaje: mensajes.eliminar,
    guardarCliente: usuarios.guardar,
    eliminarCliente: usuarios.eliminar,
    guardarAjustes: ajustes.guardar,
  };
}
