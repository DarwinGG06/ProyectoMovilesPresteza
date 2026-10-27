/**
 * Fecha de nacimiento: toca la línea y elige día / mes / año.
 * Sin caja blanca ni input nativo de calendario.
 */

import { useMemo, useState } from 'react';
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from 'react-hook-form';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import Button from '@/components/Button';
import { Pergamino } from '@/shared/components/materiales/Pergamino';
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
}: Props<T>) {
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
        <View className="gap-1.5">
          <Text className="font-roboto text-[10px] tracking-[2px] text-marca">{label}</Text>
          <SelectorNativo
            valor={String(value || '')}
            error={Boolean(error)}
            min={min}
            max={max}
            sugerida={sugerida}
            onChange={onChange}
          />
          {error ? (
            <Text className="font-roboto text-xs text-red-600">{error.message}</Text>
          ) : (
            <Text className="font-roboto text-[11px] text-tinta/70">
              Debes tener al menos {EDAD_MINIMA_REGISTRO} años. Esta fecha no se cambia después.
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
  min,
  max,
  sugerida,
  onChange,
}: {
  valor: string;
  error: boolean;
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
        className={`min-h-12 justify-center border-b bg-transparent px-0 py-3 ${error ? 'border-red-600' : 'border-madera/25'}`}>
        <Text className={`font-roboto-light text-[17px] ${valor ? 'text-tinta' : 'text-tinta/35'}`}>
          {valor ? formatearFechaLarga(valor) : 'Selecciona la fecha'}
        </Text>
      </Pressable>
      <Modal visible={abierto} transparent animationType="fade" onRequestClose={() => setAbierto(false)}>
        <Pressable className="flex-1 justify-end bg-marca-oscura/55" onPress={() => setAbierto(false)}>
          <Pressable onPress={(evento) => evento.stopPropagation()}>
            <Pergamino>
              <View className="px-6 pb-10 pt-6">
                <Text className="font-roboto text-[10px] tracking-[2px] text-marca">NACIMIENTO</Text>
                <Text className="mt-2 font-roboto text-2xl text-tinta">Elige tu fecha</Text>
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
