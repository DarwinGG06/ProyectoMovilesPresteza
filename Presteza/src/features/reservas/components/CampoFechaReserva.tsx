import { useMemo, useState } from 'react';
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from 'react-hook-form';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import Button from '@/components/Button';
import { Pergamino } from '@/shared/components/materiales/Pergamino';

import {
  fechaTopeReserva,
  formatearFechaReserva,
  mensajeFechaReserva,
  parsearFechaReserva,
} from '../utils';

const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label?: string;
};

function diasDelMes(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function rango(desde: number, hasta: number) {
  const valores: number[] = [];
  for (let n = desde; n <= hasta; n += 1) valores.push(n);
  return valores;
}

function hoyLocal() {
  const hoy = new Date();
  return new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
}

export function CampoFechaReserva<T extends FieldValues>({
  control,
  name,
  label = 'Fecha',
}: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={{
        required: 'Elige la fecha',
        validate: (valor) => mensajeFechaReserva(String(valor || '')) || true,
      }}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View className="gap-1.5">
          <Text className="font-roboto text-[10px] tracking-[2px] text-marca">{label}</Text>
          <SelectorFecha
            valor={String(value || '')}
            error={Boolean(error)}
            onChange={onChange}
          />
          {error ? <Text className="font-roboto text-xs text-red-600">{error.message}</Text> : null}
        </View>
      )}
    />
  );
}

function SelectorFecha({
  valor,
  error,
  onChange,
}: {
  valor: string;
  error: boolean;
  onChange: (fecha: string) => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const min = hoyLocal();
  const max = fechaTopeReserva(min);
  const actual = parsearFechaReserva(valor);
  const inicial = actual && actual >= min ? actual : min;
  const [anio, setAnio] = useState(inicial.getFullYear());
  const [mes, setMes] = useState(inicial.getMonth() + 1);
  const [dia, setDia] = useState(inicial.getDate());

  const anios = useMemo(() => rango(min.getFullYear(), max.getFullYear()), [max, min]);
  const maxDia = diasDelMes(anio, mes);
  const dias = useMemo(() => rango(1, maxDia), [maxDia]);

  const abrir = () => {
    const base = actual && actual >= min && actual <= max ? actual : min;
    setAnio(base.getFullYear());
    setMes(base.getMonth() + 1);
    setDia(Math.min(base.getDate(), diasDelMes(base.getFullYear(), base.getMonth() + 1)));
    setAbierto(true);
  };

  const confirmar = () => {
    const seguro = Math.min(dia, diasDelMes(anio, mes));
    const elegida = new Date(anio, mes - 1, seguro);
    if (elegida < min || elegida > max) return;
    onChange(formatearFechaReserva(elegida));
    setAbierto(false);
  };

  const texto = actual
    ? actual.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Selecciona la fecha';

  return (
    <>
      <Pressable
        onPress={abrir}
        className={`min-h-12 justify-center border-b bg-transparent px-0 py-3 ${error ? 'border-red-600' : 'border-madera/25'}`}>
        <Text className={`font-roboto-light text-[17px] ${valor ? 'text-tinta' : 'text-tinta/35'}`}>
          {texto}
        </Text>
      </Pressable>
      <Modal visible={abierto} transparent animationType="fade" onRequestClose={() => setAbierto(false)}>
        <Pressable className="flex-1 justify-end bg-marca-oscura/55" onPress={() => setAbierto(false)}>
          <Pressable onPress={(evento) => evento.stopPropagation()}>
            <Pergamino>
              <View className="px-6 pb-10 pt-6">
                <Text className="font-roboto text-[10px] tracking-[2px] text-marca">RESERVA</Text>
                <Text className="mt-2 font-roboto text-2xl text-tinta">Elige el día</Text>
                <View className="mt-5 h-44 flex-row">
                  <Columna
                    opciones={dias.map((n) => ({ valor: n, etiqueta: String(n).padStart(2, '0') }))}
                    elegido={Math.min(dia, maxDia)}
                    onElegir={setDia}
                  />
                  <Columna
                    opciones={MESES.map((etiqueta, index) => ({ valor: index + 1, etiqueta }))}
                    elegido={mes}
                    onElegir={setMes}
                  />
                  <Columna
                    opciones={anios.map((n) => ({ valor: n, etiqueta: String(n) }))}
                    elegido={anio}
                    onElegir={setAnio}
                  />
                </View>
                <Button className="mt-5" variant="gold" text="LISTO" onPress={confirmar} />
              </View>
            </Pergamino>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function Columna({
  opciones,
  elegido,
  onElegir,
}: {
  opciones: { valor: number; etiqueta: string }[];
  elegido: number;
  onElegir: (valor: number) => void;
}) {
  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      {opciones.map((opcion) => {
        const activo = opcion.valor === elegido;
        return (
          <Pressable
            key={opcion.valor}
            onPress={() => onElegir(opcion.valor)}
            accessibilityRole="button"
            className="min-h-12 justify-center py-2">
            <Text
              className={`text-center font-roboto ${
                activo ? 'text-lg text-tinta' : 'text-tinta/70'
              }`}>
              {opcion.etiqueta}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
