import React from 'react';
import { Text, View } from 'react-native';

import Button from '@/components/Button';
import Field from '@/components/Field';
import { Pergamino } from '@/shared/components/materiales/Pergamino';

import { useCtaInicio } from '../hooks/useCtaInicio';
import { MarcaCurso } from './MesaDecor';

export function CtaInicio() {
  const { control, reservar, verMenu, llamar, esAdmin } = useCtaInicio();

  return (
    <View className="bg-marca-oscura px-5 pb-14">
      {esAdmin ? (
        <MarcaCurso numero="V" nombre="LA CARTA" />
      ) : (
        <MarcaCurso numero="V" nombre="RESERVAS" />
      )}

      {esAdmin ? null : (
      <Pergamino>
        <View className="px-6 py-8">
          <Text className="font-roboto text-[10px] tracking-[4px] text-marca">RESERVA TU MESA</Text>
          <Text className="mt-3 font-serif-light text-3xl text-tinta">¿Cuántos vienen?</Text>
          <Text className="mt-2 font-serif-italic text-base text-tinta/50">
            Te esperamos en Milán, Manizales.
          </Text>

          <View className="mb-7 mt-7 h-px w-10 bg-marca/25" />

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
      </Pergamino>
      )}

      <View className="mt-6 flex-row gap-3">
        <Button text="VER MENÚ" onPress={verMenu} variant="ghost" className="flex-1" />
        <Button text="LLAMAR" onPress={llamar} variant="gold" className="flex-1" />
      </View>
    </View>
  );
}
