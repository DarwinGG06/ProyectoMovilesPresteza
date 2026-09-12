import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/auth/AuthContext';

import {
  listarAdicionales,
  listarCategorias,
  listarInsumos,
  listarMensajes,
  listarPedidos,
  listarProductos,
  listarReservas,
  listarUsuarios,
} from '../api/adminApi';
import type {
  AdicionalAdmin,
  CategoriaAdmin,
  ClienteAdmin,
  InsumoAdmin,
  MensajeAdmin,
  PedidoAdmin,
  ProductoAdmin,
  ReservaAdmin,
} from '../types';
import { calcularStats } from '../utils';

export function useAdmin() {
  const { user, token, logout } = useAuth();
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pedidos, setPedidos] = useState<PedidoAdmin[]>([]);
  const [reservas, setReservas] = useState<ReservaAdmin[]>([]);
  const [productos, setProductos] = useState<ProductoAdmin[]>([]);
  const [categorias, setCategorias] = useState<CategoriaAdmin[]>([]);
  const [insumos, setInsumos] = useState<InsumoAdmin[]>([]);
  const [adicionales, setAdicionales] = useState<AdicionalAdmin[]>([]);
  const [mensajes, setMensajes] = useState<MensajeAdmin[]>([]);
  const [usuarios, setUsuarios] = useState<ClienteAdmin[]>([]);

  const recargar = useCallback(async () => {
    if (!token) return;
    setError(null);
    setCargando(true);
    try {
      const [listaPedidos, listaReservas, listaProductos, listaCategorias, listaInsumos, listaAdicionales, listaMensajes, listaUsuarios] =
        await Promise.all([
          listarPedidos(token),
          listarReservas(token),
          listarProductos(token),
          listarCategorias(token),
          listarInsumos(token),
          listarAdicionales(token),
          listarMensajes(token),
          listarUsuarios(token),
        ]);

      setPedidos(listaPedidos);
      setReservas(listaReservas);
      setProductos(listaProductos);
      setCategorias(listaCategorias);
      setInsumos(listaInsumos);
      setAdicionales(listaAdicionales);
      setMensajes(listaMensajes);
      setUsuarios(listaUsuarios);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la casa.');
    } finally {
      setCargando(false);
    }
  }, [token]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const clientes = useMemo<ClienteAdmin[]>(() => {
    const deServidor = usuarios.filter((usuario) => usuario.role !== 'admin');

    return deServidor.map((cliente) => {
      const susPedidos = pedidos.filter(
        (pedido) =>
          (pedido.userId && pedido.userId === cliente.id) ||
          (pedido.user_name && (pedido.user_name === cliente.name || pedido.user_name === cliente.email)),
      );
      const susReservas = reservas.filter(
        (reserva) =>
          (cliente.email && reserva.userEmail === cliente.email) ||
          (cliente.name && reserva.userName === cliente.name),
      );

      return {
        ...cliente,
        totalOrders: susPedidos.length,
        totalReservations: susReservas.length,
        totalSpent: susPedidos.reduce((suma, pedido) => suma + (Number(pedido.total) || 0), 0),
      };
    });
  }, [pedidos, reservas, usuarios]);

  const stats = useMemo(
    () =>
      calcularStats({
        pedidos,
        productos,
        reservas,
        mensajes,
        clientes,
        categorias,
        insumos,
        adicionales,
      }),
    [adicionales, categorias, clientes, insumos, mensajes, pedidos, productos, reservas],
  );

  return {
    user,
    token,
    logout,
    cargando,
    error,
    setError,
    recargar,
    pedidos,
    setPedidos,
    reservas,
    setReservas,
    productos,
    setProductos,
    categorias,
    setCategorias,
    insumos,
    setInsumos,
    adicionales,
    setAdicionales,
    mensajes,
    setMensajes,
    clientes,
    setClientes: (lista: ClienteAdmin[]) => {
      setUsuarios((previos) => [...previos.filter((usuario) => usuario.role === 'admin'), ...lista]);
    },
    stats,
  };
}
