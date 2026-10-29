import { router } from 'expo-router';
import { useCallback, useEffect, useMemo } from 'react';

import { useReservas } from '@/features/reservas/hooks/useReservas';

import type { PedidoAdmin, PedidoForm, ProductoAdmin, ProductoForm } from '../types';
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
    [pedidos.pedidos, reservas.reservas, usuarios.usuarios]
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
    ]
  );

  useEffect(() => {
    if (isAuthenticated && user && user.role !== 'admin') {
      router.replace('/perfil');
    }
  }, [isAuthenticated, user]);

  const recargarProductos = productos.recargar;
  const recargarCategorias = categorias.recargar;
  const recargarInsumos = insumos.recargar;
  const recargarAdicionales = adicionales.recargar;
  const recargarPedidos = pedidos.recargar;
  const recargarMensajes = mensajes.recargar;
  const recargarUsuarios = usuarios.recargar;
  const recargarReservas = reservas.recargar;
  const guardarPedidoAdmin = pedidos.guardar;

  const recargar = useCallback(async () => {
    await Promise.all([
      recargarProductos(),
      recargarCategorias(),
      recargarInsumos(),
      recargarAdicionales(),
      recargarPedidos(),
      recargarMensajes(),
      recargarUsuarios(),
      recargarReservas(),
    ]);
  }, [
    recargarAdicionales,
    recargarCategorias,
    recargarInsumos,
    recargarMensajes,
    recargarPedidos,
    recargarProductos,
    recargarReservas,
    recargarUsuarios,
  ]);

  const guardarPedido = useCallback(
    (datos: PedidoForm, editando?: PedidoAdmin | null) =>
      guardarPedidoAdmin(datos, editando, clientes),
    [clientes, guardarPedidoAdmin]
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
    guardarProducto: async (datos: ProductoForm, editando?: ProductoAdmin | null) => {
      const id = await productos.guardar(datos, editando);
      if (!id) return false;
      try {
        await adicionales.vincularAPlato(id, datos.adicionalIds ?? [], datos.categoryId);
      } catch {
        // El vínculo se avisa aparte; el plato ya quedó guardado.
      }
      return true;
    },
    alternarProducto: productos.alternar,
    eliminarProducto: productos.eliminar,
    eliminarProductos: productos.eliminarVarios,
    guardarCategoria: categorias.guardar,
    eliminarCategoria: categorias.eliminar,
    eliminarCategorias: categorias.eliminarVarios,
    guardarInsumo: insumos.guardar,
    eliminarInsumo: insumos.eliminar,
    eliminarInsumos: insumos.eliminarVarios,
    guardarAdicional: adicionales.guardar,
    alternarAdicional: adicionales.alternar,
    eliminarAdicional: adicionales.eliminar,
    eliminarAdicionales: adicionales.eliminarVarios,
    guardarPedido,
    cambiarEstadoPedido: pedidos.cambiarEstado,
    eliminarPedido: pedidos.eliminar,
    eliminarPedidos: pedidos.eliminarVarios,
    guardarMensaje: mensajes.guardar,
    eliminarMensaje: mensajes.eliminar,
    eliminarMensajes: mensajes.eliminarVarios,
    guardarCliente: usuarios.guardar,
    eliminarCliente: usuarios.eliminar,
    eliminarClientes: usuarios.eliminarVarios,
    guardarAjustes: ajustes.guardar,
  };
}
