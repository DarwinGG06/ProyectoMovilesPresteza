import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { IconoNav } from '@/shared/components/nav-bar/IconoNav';

import { esFinDeSemana, horaEnHorario, horarioDelDia, horasAbiertas } from '../data';

type SelectorHoraProps = {
  fecha: string;
  hora: string;
  onHora: (hora: string) => void;
  error?: string;
};

export function SelectorHora({ fecha, hora, onHora, error }: SelectorHoraProps) {
  const [aviso, setAviso] = useState<string | null>(null);
  const horario = horarioDelDia(fecha);
  const horas = useMemo(() => horasAbiertas(fecha), [fecha]);
  const indice = horas.indexOf(hora);

  useEffect(() => {
    if (hora && !horaEnHorario(fecha, hora)) {
      setAviso(`No se puede. Ese día el restaurante está abierto de ${horario.etiqueta}.`);
      return;
    }
    setAviso(null);
  }, [fecha, hora, horario.etiqueta]);

  const mover = (paso: number) => {
    if (horas.length === 0) return;

    if (indice === -1) {
      const sugerida = horas.includes('7:00 p. m.') ? '7:00 p. m.' : horas[0];
      onHora(sugerida);
      setAviso(null);
      return;
    }

    const siguiente = indice + paso;
    if (siguiente < 0) {
      setAviso(`No se puede. El restaurante abre a las ${horas[0]}.`);
      return;
    }
    if (siguiente >= horas.length) {
      setAviso(`No se puede. El restaurante cierra a las ${horas[horas.length - 1]}.`);
      return;
    }

    onHora(horas[siguiente]);
    setAviso(null);
  };

  return (
    <View className="overflow-hidden rounded-2xl bg-[#6b1d3d] px-4 py-4">
      <Text className="text-[10px] font-semibold tracking-[2px] text-oro">HORA</Text>
      <Text className="mt-1 text-xs text-crema/70">
        {esFinDeSemana(fecha) ? 'Sábado y domingo' : 'Lunes a viernes'} · {horario.etiqueta}
      </Text>

      <View className="mt-4 flex-row items-center justify-between">
        <Pressable
          onPress={() => mover(-1)}
          className="h-12 w-12 items-center justify-center rounded-full bg-white/10">
          <IconoNav name="chevron-back" size={26} className="text-crema" />
        </Pressable>

        <View className="items-center px-2">
          <Text className="text-3xl font-light text-crema">{hora || '--:--'}</Text>
          <Text className="mt-1 text-[10px] tracking-[1px] text-oro">
            {hora ? 'DENTRO DEL HORARIO' : 'ELIGE CON LAS FLECHAS'}
          </Text>
        </View>

        <Pressable
          onPress={() => mover(1)}
          className="h-12 w-12 items-center justify-center rounded-full bg-white/10">
          <IconoNav name="chevron-forward" size={26} className="text-crema" />
        </Pressable>
      </View>

      <View className="mt-4 flex-row flex-wrap justify-center gap-1.5">
        {horas.filter((_, index) => index % 2 === 0).map((item) => {
          const activa = hora === item;
          return (
            <Pressable
              key={item}
              onPress={() => {
                onHora(item);
                setAviso(null);
              }}
              className={`rounded-full px-2.5 py-1 ${activa ? 'bg-oro' : 'bg-white/10'}`}>
              <Text className={`text-[10px] ${activa ? 'text-marca-oscura' : 'text-crema/80'}`}>{item}</Text>
            </Pressable>
          );
        })}
      </View>

      {aviso || error ? (
        <Text className="mt-3 text-center text-xs font-semibold text-[#ffd0a8]">
          {aviso ?? error}
        </Text>
      ) : null}
    </View>
  );
}
