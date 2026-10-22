import { Controller, type Control } from 'react-hook-form';
import { Text, View } from 'react-native';

import Button from '@/components/Button';
import Field from '@/components/Field';

import { horaEnHorario } from '../data';
import type { ReservaForm } from '../types';
import { CampoFechaReserva } from './CampoFechaReserva';
import { SelectorHora } from './SelectorHora';

type FormularioNuevaReservaProps = {
  control: Control<ReservaForm>;
  subtitulo: string;
  fecha: string;
  hora: string;
  onHora: (hora: string) => void;
  onEnviar: () => void;
  guardando: boolean;
  deshabilitado: boolean;
  etiqueta: string;
  exito: boolean;
};

export function FormularioNuevaReserva({
  control,
  subtitulo,
  fecha,
  hora,
  onHora,
  onEnviar,
  guardando,
  deshabilitado,
  etiqueta,
  exito,
}: FormularioNuevaReservaProps) {
  return (
    <View className="mt-8">
      <View className="mb-3 h-px w-10 bg-marca/40" />
      <Text className="font-roboto text-[10px] tracking-[4px] text-marca">NUEVA RESERVA</Text>
      <Text className="mt-2 font-serif-light text-3xl text-tinta">Completa tu reserva</Text>
      <Text className="mt-2 font-roboto text-sm text-tinta/55">{subtitulo}</Text>

      {exito ? (
        <View className="mb-5 mt-5 border border-marca/20 bg-marca/5 px-4 py-3">
          <Text className="text-center font-roboto text-sm text-marca">
            Reserva realizada. Te esperamos en Presteza.
          </Text>
        </View>
      ) : null}

      <View className="mt-5 gap-4">
        <CampoFechaReserva control={control} name="date" />

        <Controller
          control={control}
          name="time"
          rules={{
            required: 'La hora es requerida',
            validate: (valor) =>
              horaEnHorario(fecha, valor) || 'Esa hora está fuera del horario del restaurante',
          }}
          render={({ field, fieldState }) => (
            <SelectorHora
              fecha={fecha}
              hora={field.value || hora}
              onHora={(siguiente) => {
                field.onChange(siguiente);
                onHora(siguiente);
              }}
              error={fieldState.error?.message}
            />
          )}
        />

        <Field
          control={control}
          name="numberOfPeople"
          label="Número de personas"
          placeholder="Ej: 2"
          keyboardType="number-pad"
          rules={{
            required: 'El número de personas es requerido',
            validate: (valor) => {
              const numero = Number(valor);
              if (!numero || numero < 1) return 'Mínimo 1 persona';
              if (numero > 20) return 'Máximo 20 personas';
              return true;
            },
          }}
        />

        <Field
          control={control}
          name="specialRequests"
          label="Solicitudes especiales"
          placeholder="Ej: Mesa cerca de la ventana, cumpleaños..."
          autoCapitalize="sentences"
          multiline
        />
      </View>

      <Button
        className="mt-6"
        text={guardando ? 'PROCESANDO...' : etiqueta}
        onPress={onEnviar}
        disabled={guardando || deshabilitado}
        variant="gold"
      />
    </View>
  );
}
