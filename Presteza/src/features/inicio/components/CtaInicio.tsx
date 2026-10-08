import React from 'react';
import { Text, View } from 'react-native';

import Button from '@/components/Button';
import Field from '@/components/Field';

import { useCtaInicio } from '../hooks/useCtaInicio';
import { MarcaCurso, PuntosTicket } from './MesaDecor';

export function CtaInicio() {
  const { control, reservar, verMenu, llamar } = useCtaInicio();

  return (
    <View className="bg-marca-oscura px-5 pb-14">
      <MarcaCurso numero="V" nombre="RESERVAS" />

      <View className="border border-oro/15 bg-crema px-5 py-6">
        <Text className="font-roboto text-[10px] tracking-[4px] text-marca">RESERVA TU MESA</Text>
        <Text className="mt-2 font-roboto-light text-3xl text-marca-oscura">¿Cuántos vienen?</Text>
        <Text className="mt-1 font-roboto text-sm text-texto/55">
          Te esperamos en Milán, Manizales.
        </Text>

        <View className="my-5">
          <PuntosTicket />
        </View>

        <View className="gap-4">
          <Field
            control={control}
            name="nombre"
            label="Nombre"
            placeholder="Tu nombre"
            maxLength={80}
            rules={{
              required: 'Escribe tu nombre',
              maxLength: { value: 80, message: 'Máximo 80 caracteres' },
            }}
          />
          <Field
            control={control}
            name="personas"
            label="Número de personas"
            placeholder="Ej: 2"
            keyboardType="number-pad"
            maxLength={2}
            rules={{ required: 'Indica cuántas personas' }}
          />
        </View>

        <Button text="RESERVAR" onPress={reservar} className="mt-6" />
      </View>

      <View className="mt-6 flex-row gap-3">
        <Button text="VER MENÚ" onPress={verMenu} variant="ghost" className="flex-1" />
        <Button text="LLAMAR" onPress={llamar} variant="gold" className="flex-1" />
      </View>
    </View>
  );
}
