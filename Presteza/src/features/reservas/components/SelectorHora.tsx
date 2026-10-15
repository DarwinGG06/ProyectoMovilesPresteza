import { Pressable, Text, View } from 'react-native';

import { IconoNav } from '@/shared/components/nav-bar/IconoNav';

import { useSelectorHora } from '../hooks/useSelectorHora';

type SelectorHoraProps = {
  fecha: string;
  hora: string;
  onHora: (hora: string) => void;
  error?: string;
};

export function SelectorHora({ fecha, hora, onHora, error }: SelectorHoraProps) {
  const { aviso, etiquetaHorario, etiquetaDias, atajos, mover, elegir } = useSelectorHora({
    fecha,
    hora,
    onHora,
  });

  return (
    <View className="overflow-hidden rounded-2xl bg-[#6b1d3d] px-4 py-4">
      <Text className="font-roboto-semibold text-[10px] tracking-[2px] text-oro">HORA</Text>
      <Text className="mt-1 font-roboto text-xs text-crema/70">
        {etiquetaDias} · {etiquetaHorario}
      </Text>

      <View className="mt-4 flex-row items-center justify-between">
        <Pressable
          onPress={() => mover(-1)}
          className="h-12 w-12 items-center justify-center rounded-full bg-white/10">
          <IconoNav name="chevron-back" size={26} className="text-crema" />
        </Pressable>

        <View className="items-center px-2">
          <Text className="font-roboto-light text-3xl text-crema">{hora || '--:--'}</Text>
          <Text className="mt-1 font-roboto text-[10px] tracking-[1px] text-oro">
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
        {atajos.map((item) => {
          const activa = hora === item;
          return (
            <Pressable
              key={item}
              onPress={() => elegir(item)}
              className={`rounded-full px-2.5 py-1 ${activa ? 'bg-oro' : 'bg-white/10'}`}>
              <Text
                className={`font-roboto text-[10px] ${activa ? 'text-marca-oscura' : 'text-crema/80'}`}>
                {item}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {aviso || error ? (
        <Text className="mt-3 text-center font-roboto-semibold text-xs text-[#ffd0a8]">
          {aviso ?? error}
        </Text>
      ) : null}
    </View>
  );
}
