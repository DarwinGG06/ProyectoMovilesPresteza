import { Text, View } from 'react-native';

const PASOS = ['Confirmado', 'Preparando', 'Listo', 'Entregado'] as const;

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

  if (paso < 0) {
    return (
      <Text className={`font-roboto ${amplia ? 'text-base' : 'text-sm'} text-red-700`}>
        Este pedido fue cancelado.
      </Text>
    );
  }

  return (
    <View className={amplia ? 'mt-2' : 'mt-4'}>
      <View className="flex-row items-center">
        {PASOS.map((nombre, index) => {
          const activo = index <= paso;
          const ultimo = index === PASOS.length - 1;
          return (
            <View key={nombre} className="flex-1 flex-row items-center">
              <View
                className={`h-2.5 w-2.5 rounded-full ${activo ? 'bg-marca' : 'border border-madera/40'}`}
              />
              {ultimo ? null : (
                <View className={`mx-1 h-px flex-1 ${activo && index < paso ? 'bg-marca' : 'bg-madera/25'}`} />
              )}
            </View>
          );
        })}
      </View>
      <View className="mt-2 flex-row justify-between">
        {PASOS.map((nombre, index) => (
          <Text
            key={nombre}
            className={`flex-1 text-center font-roboto ${amplia ? 'text-[11px]' : 'text-[10px]'} ${
              index <= paso ? 'text-tinta' : 'text-tinta/70'
            }`}>
            {nombre}
          </Text>
        ))}
      </View>
    </View>
  );
}
