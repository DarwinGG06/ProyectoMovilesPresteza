import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const PASOS = ['Pendiente', 'Preparando', 'Listo', 'Entregado'] as const;

export function pasoDeEstado(status: string) {
  const clave = String(status || '').trim().toLowerCase();
  if (clave === 'cancelled' || clave === 'cancelado') return -1;
  if (clave === 'pending' || clave === 'pendiente') return 0;
  if (clave === 'preparing' || clave === 'en_proceso' || clave === 'preparando') return 1;
  if (clave === 'ready' || clave === 'listo' || clave === 'completado') return 2;
  if (clave === 'delivered' || clave === 'entregado') return 3;
  return 0;
}

export function BarraEstadosPedido({
  status,
  amplia,
}: {
  status: string;
  amplia?: boolean;
}) {
  const paso = pasoDeEstado(status);
  const avance = useSharedValue(0);
  const pulso = useSharedValue(1);
  const anchoLinea = useSharedValue(0);

  useEffect(() => {
    if (paso < 0) return;
    avance.value = withTiming(paso / (PASOS.length - 1), {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
    pulso.value = withRepeat(
      withTiming(1.75, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [avance, paso, pulso]);

  const relleno = useAnimatedStyle(() => ({
    width: Math.max(anchoLinea.value * avance.value, 0),
  }));

  const halo = useAnimatedStyle(() => ({
    transform: [{ scale: pulso.value }],
    opacity: 1.9 - pulso.value,
  }));

  if (paso < 0) {
    return (
      <Text className={`font-roboto ${amplia ? 'text-base' : 'text-sm'} text-red-700`}>
        Este pedido fue cancelado.
      </Text>
    );
  }

  return (
    <View className={amplia ? 'mt-2' : 'mt-4'}>
      <View
        className="relative h-5 justify-center px-5"
        onLayout={(evento) => {
          anchoLinea.value = evento.nativeEvent.layout.width - 40;
        }}>
        <View className="h-px bg-madera/20" />
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              left: 20,
              top: 9,
              height: 2,
              backgroundColor: '#6b1d3d',
            },
            relleno,
          ]}
        />
      </View>

      <View className="-mt-5 flex-row justify-between">
        {PASOS.map((nombre, index) => {
          const actual = index === paso;
          const hecho = index < paso;

          return (
            <View key={nombre} className="w-1/4 items-center">
              <View className="h-5 w-5 items-center justify-center">
                {actual ? (
                  <Animated.View
                    style={[
                      {
                        position: 'absolute',
                        height: 18,
                        width: 18,
                        borderRadius: 9,
                        backgroundColor: 'rgba(212,175,119,0.4)',
                      },
                      halo,
                    ]}
                  />
                ) : null}
                <View
                  className={`h-2.5 w-2.5 rounded-full ${
                    actual || hecho ? 'bg-marca' : 'border border-madera/40 bg-pergamino'
                  }`}
                />
              </View>
              <Text
                className={`mt-2 text-center font-roboto ${amplia ? 'text-[11px]' : 'text-[10px]'} ${
                  actual ? 'text-tinta' : 'text-tinta/70'
                }`}>
                {nombre}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
