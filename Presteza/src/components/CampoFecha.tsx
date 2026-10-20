/**
 * Campo de fecha nativo (calendario), no texto libre.
 * En web usa <input type="date">. En nativo, un selector de día/mes/año.
 */

import { createElement, useMemo, useState } from 'react';
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from 'react-hook-form';
import { Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';

import {
  aIso,
  deIso,
  EDAD_MINIMA_REGISTRO,
  fechaMaximaRegistro,
  fechaMinimaRegistro,
  formatearFechaLarga,
  mensajeEdadRegistro,
  restarAnios,
} from '@/shared/fechaNacimiento';

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
  label: string;
  rules?: RegisterOptions<T, Path<T>>;
  variante?: 'caja' | 'linea';
};

function diasDelMes(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function rango(desde: number, hasta: number) {
  const paso = desde <= hasta ? 1 : -1;
  const valores: number[] = [];
  for (let n = desde; n !== hasta + paso; n += paso) valores.push(n);
  return valores;
}

export default function CampoFecha<T extends FieldValues>({
  control,
  name,
  label,
  rules,
  variante = 'caja',
}: Props<T>) {
  const linea = variante === 'linea';
  const min = fechaMinimaRegistro();
  const max = fechaMaximaRegistro();
  const sugerida = restarAnios(max, 3);

  return (
    <Controller
      control={control}
      name={name}
      rules={{
        required: 'La fecha de nacimiento es obligatoria',
        validate: (valor) => mensajeEdadRegistro(String(valor || '')) || true,
        ...rules,
      }}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View className={linea ? 'gap-0.5' : 'gap-1.5'}>
          <Text
            className={
              linea
                ? 'font-roboto text-[10px] tracking-[2px] text-marca'
                : 'font-roboto-semibold text-marca-oscura'
            }>
            {label}
          </Text>
          {Platform.OS === 'web' ? (
            <View
              className={
                linea
                  ? `border-b bg-transparent px-0 py-2 ${error ? 'border-red-600' : 'border-marca/20'}`
                  : `border bg-white px-3.5 py-2.5 ${error ? 'border-red-600' : 'border-linea'}`
              }>
              {createElement('input', {
                type: 'date',
                value: value || '',
                min: aIso(min),
                max: aIso(max),
                onChange: (evento: { target: { value: string } }) => onChange(evento.target.value),
                style: {
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  fontSize: linea ? 18 : 16,
                  color: '#3a0c20',
                  fontFamily: 'Roboto, sans-serif',
                },
              })}
            </View>
          ) : (
            <SelectorNativo
              valor={String(value || '')}
              error={Boolean(error)}
              linea={linea}
              min={min}
              max={max}
              sugerida={sugerida}
              onChange={onChange}
            />
          )}
          {error ? (
            <Text className="font-roboto text-xs text-red-600">{error.message}</Text>
          ) : (
            <Text className="font-roboto text-[11px] text-texto/50">
              Debes tener al menos {EDAD_MINIMA_REGISTRO} años.
            </Text>
          )}
        </View>
      )}
    />
  );
}

function SelectorNativo({
  valor,
  error,
  linea,
  min,
  max,
  sugerida,
  onChange,
}: {
  valor: string;
  error: boolean;
  linea: boolean;
  min: Date;
  max: Date;
  sugerida: Date;
  onChange: (iso: string) => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const inicial = deIso(valor) ?? sugerida;
  const [anio, setAnio] = useState(inicial.getFullYear());
  const [mes, setMes] = useState(inicial.getMonth() + 1);
  const [dia, setDia] = useState(inicial.getDate());

  const anios = useMemo(() => rango(max.getFullYear(), min.getFullYear()), [max, min]);
  const maxDia = diasDelMes(anio, mes);
  const dias = useMemo(() => rango(1, maxDia), [maxDia]);

  const abrir = () => {
    const actual = deIso(valor) ?? sugerida;
    setAnio(actual.getFullYear());
    setMes(actual.getMonth() + 1);
    setDia(Math.min(actual.getDate(), diasDelMes(actual.getFullYear(), actual.getMonth() + 1)));
    setAbierto(true);
  };

  const confirmar = () => {
    const seguro = Math.min(dia, diasDelMes(anio, mes));
    onChange(aIso(new Date(anio, mes - 1, seguro)));
    setAbierto(false);
  };

  return (
    <>
      <Pressable
        onPress={abrir}
        className={
          linea
            ? `border-b bg-transparent px-0 py-3 ${error ? 'border-red-600' : 'border-marca/20'}`
            : `border bg-white p-3.5 ${error ? 'border-red-600' : 'border-linea'}`
        }>
        <Text className={`font-roboto ${valor ? 'text-marca-oscura' : 'text-texto/40'}`}>
          {valor ? formatearFechaLarga(valor) : 'Selecciona la fecha'}
        </Text>
      </Pressable>
      <Modal visible={abierto} transparent animationType="fade" onRequestClose={() => setAbierto(false)}>
        <Pressable className="flex-1 justify-end bg-black/40" onPress={() => setAbierto(false)}>
          <Pressable className="bg-white px-5 pb-8 pt-5" onPress={(evento) => evento.stopPropagation()}>
            <Text className="mb-4 font-roboto-semibold text-marca-oscura">Fecha de nacimiento</Text>
            <View className="h-44 flex-row">
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
            <Pressable onPress={confirmar} className="mt-4 bg-marca-oscura py-3">
              <Text className="text-center font-roboto text-[12px] tracking-[2px] text-crema">LISTO</Text>
            </Pressable>
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
          <Pressable key={opcion.valor} onPress={() => onElegir(opcion.valor)} className="py-2">
            <Text
              className={`text-center font-roboto ${activo ? 'text-marca-oscura' : 'text-texto/35'}`}>
              {opcion.etiqueta}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
