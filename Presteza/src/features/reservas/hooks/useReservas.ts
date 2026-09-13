import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
  avisoCambioEstado,
  datosDeFormulario,
  fusionarReserva,
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
  const onCambioRef = useRef(onCambio);

  useEffect(() => {
    onCambioRef.current = onCambio;
  }, [onCambio]);

  const aplicar = useCallback((mutar: (prev: Reserva[]) => Reserva[]) => {
    setReservas((prev) => {
      const siguientes = mutar(prev);
      onCambioRef.current?.(siguientes);
      return siguientes;
    });
  }, []);

  const recargar = useCallback(async () => {
    if (!token) {
      setReservas([]);
      setMesas([]);
      setCargando(false);
      return;
    }

    setError(null);
    setCargando(true);
    const [resultadoReservas, resultadoMesas] = await Promise.allSettled([
      listarReservas(token, alcance),
      listarMesas(),
    ]);

    if (resultadoReservas.status === 'fulfilled') {
      aplicar(() => resultadoReservas.value);
    } else {
      aplicar(() => []);
      setError(
        resultadoReservas.reason instanceof Error
          ? resultadoReservas.reason.message
          : 'No se pudieron cargar las reservas.',
      );
    }
    setMesas(resultadoMesas.status === 'fulfilled' ? resultadoMesas.value : []);
    setCargando(false);
  }, [alcance, aplicar, token]);

  useEffect(() => {
    let viva = true;

    void (async () => {
      if (!token) {
        if (!viva) return;
        setReservas([]);
        setMesas([]);
        setCargando(false);
        return;
      }

      setError(null);
      setCargando(true);
      const [resultadoReservas, resultadoMesas] = await Promise.allSettled([
        listarReservas(token, alcance),
        listarMesas(),
      ]);
      if (!viva) return;

      if (resultadoReservas.status === 'fulfilled') {
        aplicar(() => resultadoReservas.value);
      } else {
        aplicar(() => []);
        setError(
          resultadoReservas.reason instanceof Error
            ? resultadoReservas.reason.message
            : 'No se pudieron cargar las reservas.',
        );
      }
      setMesas(resultadoMesas.status === 'fulfilled' ? resultadoMesas.value : []);
      setCargando(false);
    })();

    return () => {
      viva = false;
    };
  }, [alcance, aplicar, token]);

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
        aplicar((prev) => [{ ...creada, ...cuerpo }, ...prev]);
        aviso.ok('Reserva creada', `La mesa ${cuerpo.tableNumber} quedó reservada.`);
        return true;
      } catch (err) {
        aviso.errorDe(err, 'No se pudo crear la reserva.', 'Reserva');
        return false;
      } finally {
        setGuardando(false);
      }
    },
    [aplicar, aviso, token],
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
        aplicar((prev) => fusionarReserva(prev, { ...reserva, ...actualizada }, cuerpo));
        aviso.ok('Reserva editada', `La mesa ${cuerpo.tableNumber} fue editada.`);
        return true;
      } catch (err) {
        aviso.errorDe(err, 'No se pudo editar la reserva.', 'Reserva');
        return false;
      } finally {
        setGuardando(false);
      }
    },
    [aplicar, aviso, token],
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
      const textos = avisoCambioEstado(reserva, status);

      aviso.confirmar({
        sello: 'MESAS',
        titulo: textos.titulo,
        texto: textos.texto,
        confirmar: textos.confirmar,
        peligro: status === 'cancelled',
        exito: { titulo: textos.listo, texto: textos.detalle },
        onConfirmar: async () => {
          await cambiarEstadoReserva(token, idReserva(reserva), status);
          aplicar((prev) => fusionarReserva(prev, reserva, { status }));
        },
      });
    },
    [aplicar, aviso, token],
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
          aplicar((prev) => prev.filter((item) => idReserva(item) !== idReserva(reserva)));
        },
      });
    },
    [aplicar, aviso, token],
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

export type CasaReservas = ReturnType<typeof useReservas>;
