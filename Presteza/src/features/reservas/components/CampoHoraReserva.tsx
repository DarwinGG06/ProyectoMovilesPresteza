import { useEffect } from 'react';
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from 'react-hook-form';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useState } from 'react';

import { Pergamino } from '@/shared/components/materiales/Pergamino';

import { horaEnHorario, horasAbiertas, horarioDelDia } from '../data';
import { normalizarHora, parsearFechaReserva } from '../utils';

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  fecha: string;
  label?: string;
};

export function CampoHoraReserva<T extends FieldValues>({
  control,
  name,
  fecha,
  label = 'Hora',
}: Props<T>) {
  const fechaValida = Boolean(parsearFechaReserva(fecha));
  const horas = fechaValida ? horasAbiertas(fecha) : [];
  const horario = horarioDelDia(fecha);

  return (
    <Controller
      control={control}
      name={name}
      rules={{
        required: 'Elige la hora',
        validate: (valor) => {
          if (!fechaValida) return 'Elige primero la fecha';
          return horaEnHorario(fecha, String(valor || '')) || `Elige una hora entre ${horario.etiqueta}`;
        },
      }}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const hora = String(value || '');
        const mostrada = horas.includes(hora)
          ? hora
          : horas.find((item) => item.toLowerCase() === normalizarHora(hora)) || hora;

        return (
          <View className="gap-1.5">
            <Text className="font-roboto text-[10px] tracking-[2px] text-marca">{label}</Text>
            <AjustarHora fecha={fecha} hora={hora} horas={horas} onChange={onChange} />
            <SelectorHoraModal
              valor={mostrada}
              horas={horas}
              deshabilitado={!fechaValida}
              error={Boolean(error)}
              onChange={onChange}
            />
            {error ? (
              <Text className="font-roboto text-xs text-red-600">{error.message}</Text>
            ) : fechaValida ? (
              <Text className="font-roboto text-[11px] text-tinta/40">{horario.etiqueta}</Text>
            ) : (
              <Text className="font-roboto text-[11px] text-tinta/40">Elige primero la fecha</Text>
            )}
          </View>
        );
      }}
    />
  );
}

function AjustarHora({
  fecha,
  hora,
  horas,
  onChange,
}: {
  fecha: string;
  hora: string;
  horas: string[];
  onChange: (hora: string) => void;
}) {
  useEffect(() => {
    if (!hora || horas.length === 0) return;
    if (horas.includes(hora)) return;
    const normal = horas.find((item) => item.toLowerCase() === normalizarHora(hora));
    onChange(normal ?? '');
  }, [fecha, hora, horas, onChange]);

  return null;
}

function SelectorHoraModal({
  valor,
  horas,
  deshabilitado,
  error,
  onChange,
}: {
  valor: string;
  horas: string[];
  deshabilitado: boolean;
  error: boolean;
  onChange: (hora: string) => void;
}) {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <Pressable
        disabled={deshabilitado}
        onPress={() => setAbierto(true)}
        className={`border-b bg-transparent px-0 py-3 ${
          error ? 'border-red-600' : 'border-madera/25'
        } ${deshabilitado ? 'opacity-40' : ''}`}>
        <Text className={`font-roboto-light text-[17px] ${valor ? 'text-tinta' : 'text-tinta/35'}`}>
          {valor || 'Selecciona la hora'}
        </Text>
      </Pressable>
      <Modal visible={abierto} transparent animationType="fade" onRequestClose={() => setAbierto(false)}>
        <Pressable className="flex-1 justify-end bg-marca-oscura/55" onPress={() => setAbierto(false)}>
          <Pressable onPress={(evento) => evento.stopPropagation()}>
            <Pergamino>
              <View className="px-6 pb-10 pt-6">
                <Text className="font-roboto text-[10px] tracking-[2px] text-marca">RESERVA</Text>
                <Text className="mt-2 font-roboto text-2xl text-tinta">Elige la hora</Text>
                <ScrollView className="mt-4 max-h-72" showsVerticalScrollIndicator={false}>
                  {horas.map((hora) => {
                    const activa = hora === valor;
                    return (
                      <Pressable
                        key={hora}
                        onPress={() => {
                          onChange(hora);
                          setAbierto(false);
                        }}
                        className="py-2.5">
                        <Text
                          className={`text-center font-roboto ${
                            activa ? 'text-lg text-tinta' : 'text-tinta/35'
                          }`}>
                          {hora}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            </Pergamino>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
