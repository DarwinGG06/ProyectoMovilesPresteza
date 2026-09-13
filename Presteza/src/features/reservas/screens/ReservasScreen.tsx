import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ScrollView, View } from 'react-native';

import { useAviso } from '@/shared/components/aviso';
import { Footer } from '@/shared/components/footer';
import { LoginModal } from '@/shared/components/nav-bar/LoginModal';

import { FormularioNuevaReserva } from '../components/FormularioNuevaReserva';
import { HeroReservas } from '../components/HeroReservas';
import { PlanoMesas } from '../components/PlanoMesas';
import { SelectorCapacidad } from '../components/SelectorCapacidad';
import { horaEnHorario, horarioDelDia, mesasDelSalon, mostrarSelector, numeroMesa, textoSeleccion } from '../data';
import { useReservas } from '../hooks/useReservas';
import type { MesaVisual, ReservaForm, SeleccionReserva } from '../types';
import { fechaHoy } from '../utils';

export function ReservasScreen() {
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
  const mesas = useMemo(() => mesasDelSalon(casa.mesas, casa.reservas, date, time), [casa.mesas, casa.reservas, date, time]);

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
    setTimeout(() => setExito(false), 5000);
  });

  return (
    <View className="flex-1 bg-crema">
      <ScrollView showsVerticalScrollIndicator={false}>
        <HeroReservas />

        <View className="px-4 py-6">
          <PlanoMesas
            mesas={mesas}
            mesaId={seleccion?.tipo === 'mesa' ? seleccion.mesa.id : undefined}
            barra={seleccion?.tipo === 'barra'}
            personalizada={seleccion?.tipo === 'custom'}
            onMesa={elegirMesa}
            onBarra={elegirBarra}
            onPersonalizada={elegirPersonalizada}
          />

          {mostrarSelector(seleccion, personas) ? (
            <SelectorCapacidad
              valor={personas}
              onCambiar={cambiarPersonas}
              detalle={
                seleccion?.tipo === 'mesa'
                  ? `Mesa seleccionada: ${seleccion.mesa.id}`
                  : seleccion?.tipo === 'barra'
                    ? 'Barra comunal seleccionada'
                    : undefined
              }
            />
          ) : null}

          <FormularioNuevaReserva
            control={control}
            subtitulo={textoSeleccion(seleccion, personas)}
            fecha={date}
            hora={time}
            onHora={(hora) => setValue('time', hora)}
            onEnviar={enviar}
            guardando={casa.guardando}
            deshabilitado={!seleccion && casa.isAuthenticated}
            etiqueta={casa.isAuthenticated ? 'CONFIRMAR RESERVA' : 'INICIA SESIÓN PARA RESERVAR'}
            exito={exito}
          />
        </View>

        <Footer />
      </ScrollView>

      <LoginModal visible={loginAbierto} onClose={() => setLoginAbierto(false)} />
    </View>
  );
}
