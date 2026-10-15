import { Text, View } from 'react-native';

import Badge from '@/components/Badge';
import Tarjeta from '@/components/Tarjeta';
import { VALORES } from '@/features/inicio/data';
import { ContenedorPantalla } from '@/shared/components/contenedor-pantalla/ContenedorPantalla';

export function NosotrosScreen() {
  return (
    <ContenedorPantalla titulo="Nosotros">
      <Badge text="PRESTEZA" className="mt-4" />
      <Text className="mt-3 font-roboto text-base leading-6 text-texto/70">
        Restaurante en Milán, Manizales. Carne, ingredientes de calidad y una mesa para quedarse.
      </Text>

      <View className="mt-8 gap-4">
        {VALORES.map((valor) => (
          <Tarjeta key={valor.titulo}>
            <Text className="font-roboto-semibold text-lg text-marca-oscura">{valor.titulo}</Text>
            <Text className="mt-2 font-roboto text-sm leading-5 text-texto/70">{valor.texto}</Text>
          </Tarjeta>
        ))}
      </View>
    </ContenedorPantalla>
  );
}
