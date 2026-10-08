import { Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { useAnchoLinea, useCuentaEscrita } from '../hooks/useCuentaEscrita';

type Fila = {
  etiqueta: string;
  valor: string;
};

function FilaEscrita({
  fila,
  index,
  progreso,
}: {
  fila: Fila;
  index: number;
  progreso: SharedValue<number>;
}) {
  const inicio = index * 0.14;
  const { ancho: anchoLinea, medir } = useAnchoLinea();

  const entrada = useAnimatedStyle(() => ({
    opacity: interpolate(progreso.value, [inicio, inicio + 0.32], [0, 1], Extrapolation.CLAMP),
    transform: [
      { translateY: interpolate(progreso.value, [inicio, inicio + 0.32], [10, 0], Extrapolation.CLAMP) },
    ],
  }));

  const linea = useAnimatedStyle(() => ({
    width: interpolate(progreso.value, [inicio + 0.08, inicio + 0.48], [0, anchoLinea], Extrapolation.CLAMP),
  }));

  return (
    <Animated.View style={entrada}>
      <View className="flex-row items-baseline py-4">
        <Text style={{ color: '#e8c99a', width: 28, fontSize: 10, letterSpacing: 1 }}>
          {String(index + 1).padStart(2, '0')}
        </Text>
        <Text style={{ color: '#f7f1ea', fontSize: 11, letterSpacing: 2.2, width: 92 }}>{fila.etiqueta}</Text>
        <View
          onLayout={medir}
          className="mx-2 h-4 flex-1 justify-center overflow-hidden">
          <Animated.View style={[{ height: 1, backgroundColor: '#d4af77' }, linea]} />
        </View>
        <Text
          style={{
            color: '#ffffff',
            fontSize: 17,
            fontWeight: '300',
            flexShrink: 1,
            maxWidth: '48%',
            textAlign: 'right',
          }}>
          {fila.valor}
        </Text>
      </View>
    </Animated.View>
  );
}

export function CuentaEscrita({ filas, animar = true }: { filas: Fila[]; animar?: boolean }) {
  const progreso = useCuentaEscrita(filas, animar);

  return (
    <View className="border-y border-white/20 bg-white/10 px-2">
      {filas.map((fila, index) => (
        <FilaEscrita key={fila.etiqueta} fila={fila} index={index} progreso={progreso} />
      ))}
    </View>
  );
}
