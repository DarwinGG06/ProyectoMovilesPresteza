import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useAviso } from '@/shared/components/aviso';

import { horaEnHorario, horarioDelDia, mesasDelSalon, mostrarSelector, numeroMesa, textoSeleccion } from '../data';
import type { MesaVisual, ReservaForm, SeleccionReserva } from '../types';
import { fechaHoy } from '../utils';
import { useReservas } from './useReservas';

export function useNuevaReserva() {
  const casa = useReservas({ alcance: 'mias' });
  const aviso = useAviso();
  const [seleccion, setSeleccion] = useState<SeleccionReserva>(null);
  const [loginAbierto, setLoginAbierto] = useState(false);
  const [exito, setExito] = useState(false);

  const { control, handleSubmit, setValue, watch, reset } = useForm<ReservaForm>({
    defaultValues: {
      tableNumber: '',
      date: fechaHoy(),
      time: '',
      numberOfPeople: '2',
      specialRequests: '',
    },
  });

  const date = watch('date');
  const time = watch('time');
  const personas = Number(watch('numberOfPeople')) || 1;
  const mesas = useMemo(
    () => mesasDelSalon(casa.mesas, casa.reservas, date, time),
    [casa.mesas, casa.reservas, date, time],
  );

  useEffect(() => {
    if (!exito) return;
    const timer = setTimeout(() => setExito(false), 5000);
    return () => clearTimeout(timer);
  }, [exito]);

  const elegirMesa = (mesa: MesaVisual) => {
    setSeleccion({ tipo: 'mesa', mesa });
    setValue('tableNumber', mesa.id);
    setValue('numberOfPeople', String(mesa.capacity));
  };

  const elegirBarra = () => {
    setSeleccion({ tipo: 'barra' });
    setValue('tableNumber', 'BARRA');
    setValue('numberOfPeople', '1');
  };

  const elegirPersonalizada = () => {
    setSeleccion({ tipo: 'custom' });
    setValue('tableNumber', 'CUSTOM');
    setValue('numberOfPeople', String(Math.max(personas, 7)));
  };

  const cambiarPersonas = (valor: number) => {
    setValue('numberOfPeople', String(valor));
  };

  const enviar = handleSubmit(async (datos) => {
    if (!casa.isAuthenticated) {
      setLoginAbierto(true);
      return;
    }

    if (!horaEnHorario(datos.date, datos.time)) {
      const horario = horarioDelDia(datos.date);
      aviso.error('Reserva', `No se puede. El restaurante está abierto de ${horario.etiqueta}.`);
      return;
    }

    if (!seleccion) {
      aviso.error('Reserva', 'Selecciona una mesa, la barra o personaliza la capacidad.');
      return;
    }

    const invitados = Number(datos.numberOfPeople);
    if (seleccion.tipo === 'mesa' && invitados > seleccion.mesa.capacity) {
      aviso.error(
        'Reserva',
        `La mesa ${seleccion.mesa.id} tiene capacidad para ${seleccion.mesa.capacity} personas.`,
      );
      return;
    }

    const ok = await casa.crear({
      ...datos,
      tableNumber: numeroMesa(seleccion),
    });

    if (!ok) return;

    setExito(true);
    setSeleccion(null);
    reset({
      tableNumber: '',
      date: fechaHoy(),
      time: '',
      numberOfPeople: '2',
      specialRequests: '',
    });
  });

  return {
    control,
    mesas,
    seleccion,
    personas,
    date,
    time,
    mostrarCapacidad: mostrarSelector(seleccion, personas),
    subtitulo: textoSeleccion(seleccion, personas),
    mesaId: seleccion?.tipo === 'mesa' ? seleccion.mesa.id : undefined,
    barra: seleccion?.tipo === 'barra',
    personalizada: seleccion?.tipo === 'custom',
    detalleCapacidad:
      seleccion?.tipo === 'mesa'
        ? `Mesa seleccionada: ${seleccion.mesa.id}`
        : seleccion?.tipo === 'barra'
          ? 'Barra comunal seleccionada'
          : undefined,
    elegirMesa,
    elegirBarra,
    elegirPersonalizada,
    cambiarPersonas,
    elegirHora: (hora: string) => setValue('time', hora),
    enviar,
    guardando: casa.guardando,
    deshabilitado: !seleccion && casa.isAuthenticated,
    etiqueta: casa.isAuthenticated ? 'CONFIRMAR RESERVA' : 'INICIA SESIÓN PARA RESERVAR',
    exito,
    loginAbierto,
    cerrarLogin: () => setLoginAbierto(false),
  };
}
