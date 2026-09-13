import { Controller, type Control } from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';

import Field from '../../../../components/Field';
import { IconoNav } from '@/shared/components/nav-bar/IconoNav';

import { horaEnHorario } from '../data';
import type { ReservaForm } from '../types';
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
    <View className="mt-6 rounded-[24px] bg-white px-5 py-6 shadow-lg shadow-marca/20">
      <View className="mb-5 items-center">
        <View className="mb-3 h-16 w-16 items-center justify-center rounded-full bg-marca/10">
          <IconoNav name="calendar" size={30} className="text-marca" />
        </View>
        <Text className="text-center text-2xl font-bold uppercase tracking-[1px] text-marca">Completa tu reserva</Text>
        <Text className="mt-2 text-center text-sm text-marca-clara">{subtitulo}</Text>
      </View>

      {exito ? (
        <View className="mb-5 rounded-2xl bg-[#28a745] px-4 py-3">
          <Text className="text-center text-sm font-semibold text-white">
            ¡Reserva realizada! Te esperamos en Presteza.
          </Text>
        </View>
      ) : null}

      <View className="gap-4">
        <Field
          control={control}
          name="date"
          label="Fecha"
          placeholder="DD/MM/AAAA"
          rules={{
            required: 'La fecha es requerida',
            pattern: { value: /^\d{2}\/\d{2}\/\d{4}$/, message: 'Usa DD/MM/AAAA' },
          }}
        />

        <Controller
          control={control}
          name="time"
          rules={{
            required: 'La hora es requerida',
            validate: (valor) => horaEnHorario(fecha, valor) || 'Esa hora está fuera del horario del restaurante',
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

      <Pressable
        onPress={onEnviar}
        disabled={guardando || deshabilitado}
        className={`mt-6 rounded-full py-4 ${guardando || deshabilitado ? 'bg-marca/40' : 'bg-marca'}`}>
        <Text className="text-center text-[12px] font-bold tracking-[2px] text-white">
          {guardando ? 'PROCESANDO...' : etiqueta}
        </Text>
      </Pressable>
    </View>
  );
}
