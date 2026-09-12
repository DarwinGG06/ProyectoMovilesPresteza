import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/auth/AuthContext';
import { useAviso } from '@/shared/components/aviso';

import {
  actualizarReserva,
  cambiarEstadoReserva,
  crearReserva,
  eliminarReserva,
  listarMesas,
  listarReservas,
} from '../api/reservasApi';
import type { AlcanceReservas, Mesa, Reserva, ReservaForm } from '../types';
import {
  datosDeFormulario,
  idReserva,
  mesasDisponibles,
  ordenarReservas,
  sePuedeEditar,
  textoEstadoReserva,
  valoresReserva,
} from '../utils';

type UseReservasOpciones = {
  alcance?: AlcanceReservas;
  onCambio?: (reservas: Reserva[]) => void;
};

export function useReservas({ alcance = 'mias', onCambio }: UseReservasOpciones = {}) {
  const { token, user, isAuthenticated } = useAuth();
  const aviso = useAviso();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<'all' | Reserva['status']>('all');

  const publicar = useCallback(
    (siguientes: Reserva[]) => {
      setReservas(siguientes);
      onCambio?.(siguientes);
    },
    [onCambio],
  );

  const recargar = useCallback(async () => {
    if (!token) return;

    setError(null);
    setCargando(true);
    try {
      const [lista, listaMesas] = await Promise.all([
        listarReservas(token, alcance),
        listarMesas().catch(() => [] as Mesa[]),
      ]);
      publicar(lista);
      setMesas(listaMesas);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las reservas.');
    } finally {
      setCargando(false);
    }
  }, [alcance, publicar, token]);

  useEffect(() => {
    let viva = true;
    const timer = setTimeout(() => {
      if (viva) void recargar();
    }, 0);
    return () => {
      viva = false;
      clearTimeout(timer);
    };
  }, [recargar]);

  const lista = useMemo(() => {
    const ordenadas = ordenarReservas(reservas);
    if (filtro === 'all') return ordenadas;
    return ordenadas.filter((reserva) => reserva.status === filtro);
  }, [filtro, reservas]);

  const crear = useCallback(
    async (datos: ReservaForm) => {
      if (!token) {
        aviso.error('Reserva', 'Inicia sesión para reservar.');
        return false;
      }
      const cuerpo = datosDeFormulario(datos);
      if (!cuerpo.tableNumber) {
        aviso.error('Reserva', 'Elige una mesa.');
        return false;
      }

      setGuardando(true);
      try {
        const creada = await crearReserva(token, cuerpo);
        publicar([creada, ...reservas]);
        aviso.ok('Reserva creada', `La mesa ${cuerpo.tableNumber} quedó reservada.`);
        return true;
      } catch (err) {
        aviso.errorDe(err, 'No se pudo crear la reserva.', 'Reserva');
        return false;
      } finally {
        setGuardando(false);
      }
    },
    [aviso, publicar, reservas, token],
  );

  const editar = useCallback(
    async (reserva: Reserva, datos: ReservaForm) => {
      if (!token) return false;
      const cuerpo = datosDeFormulario(datos);
      if (!cuerpo.tableNumber) {
        aviso.error('Reserva', 'Elige una mesa.');
        return false;
      }

      setGuardando(true);
      try {
        const actualizada = await actualizarReserva(token, idReserva(reserva), cuerpo);
        publicar(
          reservas.map((item) =>
            idReserva(item) === idReserva(reserva) ? { ...item, ...actualizada, ...cuerpo } : item,
          ),
        );
        aviso.ok('Reserva editada', `La mesa ${cuerpo.tableNumber} fue editada.`);
        return true;
      } catch (err) {
        aviso.errorDe(err, 'No se pudo editar la reserva.', 'Reserva');
        return false;
      } finally {
        setGuardando(false);
      }
    },
    [aviso, publicar, reservas, token],
  );

  const guardar = useCallback(
    (datos: ReservaForm, editando?: Reserva | null) => {
      return editando ? editar(editando, datos) : crear(datos);
    },
    [crear, editar],
  );

  const cambiarEstado = useCallback(
    (reserva: Reserva, status: 'confirmed' | 'cancelled' | 'completed') => {
      if (!token) return;
      const id = idReserva(reserva);
      const aplicar = async () => {
        await cambiarEstadoReserva(token, id, status);
        publicar(reservas.map((item) => (idReserva(item) === id ? { ...item, status } : item)));
      };

      const textos = {
        cancelled: {
          titulo: 'Cancelar reserva',
          texto: `¿Cancelar la mesa ${reserva.tableNumber}?`,
          confirmar: 'CANCELAR RESERVA',
          listo: 'Reserva cancelada',
          detalle: `La mesa ${reserva.tableNumber} fue cancelada.`,
        },
        confirmed: {
          titulo: 'Confirmar reserva',
          texto: `¿Confirmar la mesa ${reserva.tableNumber}?`,
          confirmar: 'CONFIRMAR',
          listo: 'Reserva confirmada',
          detalle: `La mesa ${reserva.tableNumber} fue confirmada.`,
        },
        completed: {
          titulo: 'Completar reserva',
          texto: `¿Marcar la mesa ${reserva.tableNumber} como completada?`,
          confirmar: 'COMPLETAR',
          listo: 'Reserva completada',
          detalle: `La mesa ${reserva.tableNumber} fue completada.`,
        },
      }[status];

      aviso.confirmar({
        sello: 'MESAS',
        titulo: textos.titulo,
        texto: textos.texto,
        confirmar: textos.confirmar,
        peligro: status === 'cancelled',
        exito: { titulo: textos.listo, texto: textos.detalle },
        onConfirmar: aplicar,
      });
    },
    [aviso, publicar, reservas, token],
  );

  const eliminar = useCallback(
    (reserva: Reserva) => {
      if (!token) return;
      aviso.confirmar({
        sello: 'MESAS',
        titulo: 'Eliminar reserva',
        texto: `¿Borrar la mesa ${reserva.tableNumber} del ${reserva.date}?`,
        confirmar: 'ELIMINAR',
        peligro: true,
        exito: {
          titulo: 'Reserva eliminada',
          texto: `La reserva de la mesa ${reserva.tableNumber} fue eliminada.`,
        },
        onConfirmar: async () => {
          await eliminarReserva(token, idReserva(reserva));
          publicar(reservas.filter((item) => idReserva(item) !== idReserva(reserva)));
        },
      });
    },
    [aviso, publicar, reservas, token],
  );

  return {
    user,
    token,
    isAuthenticated,
    reservas,
    lista,
    mesas,
    mesasPara: (date: string, time: string, personas = 0, excepto?: string) =>
      mesasDisponibles(mesas, reservas, date, time, personas, excepto),
    cargando,
    guardando,
    error,
    filtro,
    setFiltro,
    recargar,
    crear,
    editar,
    guardar,
    eliminar,
    cambiarEstado,
    cancelar: (reserva: Reserva) => cambiarEstado(reserva, 'cancelled'),
    confirmar: (reserva: Reserva) => cambiarEstado(reserva, 'confirmed'),
    completar: (reserva: Reserva) => cambiarEstado(reserva, 'completed'),
    idDe: idReserva,
    sePuedeEditar,
    valoresDe: valoresReserva,
    textoEstado: textoEstadoReserva,
  };
}
