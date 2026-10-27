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
    <View className="bg-marca-oscura px-4 py-4">
      <Text className="font-roboto text-[10px] tracking-[2px] text-oro">HORA</Text>
      <Text className="mt-1 font-roboto text-xs text-crema/70">
        {etiquetaDias} · {etiquetaHorario}
      </Text>

      <View className="mt-4 flex-row items-center justify-between">
        <Pressable
          onPress={() => mover(-1)}
          accessibilityRole="button"
          accessibilityLabel="Hora anterior"
          className="min-h-12 min-w-12 items-center justify-center border border-oro/30">
          <IconoNav name="chevron-back" size={22} className="text-crema" />
        </Pressable>

        <View className="items-center px-2">
          <Text className="font-serif-light text-3xl text-crema">{hora || '--:--'}</Text>
          <Text className="mt-1 font-roboto text-[10px] tracking-[1px] text-oro">
            {hora ? 'DENTRO DEL HORARIO' : 'ELIGE CON LAS FLECHAS'}
          </Text>
        </View>

        <Pressable
          onPress={() => mover(1)}
          accessibilityRole="button"
          accessibilityLabel="Hora siguiente"
          className="min-h-12 min-w-12 items-center justify-center border border-oro/30">
          <IconoNav name="chevron-forward" size={22} className="text-crema" />
        </Pressable>
      </View>

      <View className="mt-4 flex-row flex-wrap justify-center gap-1.5">
        {atajos.map((item) => {
          const activa = hora === item;
          return (
            <Pressable
              key={item}
              onPress={() => elegir(item)}
              accessibilityRole="button"
              accessibilityState={{ selected: activa }}
              className={`min-h-12 min-w-12 items-center justify-center px-2.5 ${activa ? 'bg-oro' : 'border border-oro/25'}`}>
              <Text
                className={`font-roboto text-[10px] ${activa ? 'text-marca-oscura' : 'text-crema/80'}`}>
                {item}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {aviso || error ? (
        <Text className="mt-3 text-center font-roboto text-xs text-oro">{aviso ?? error}</Text>
      ) : null}
    </View>
  );
}
