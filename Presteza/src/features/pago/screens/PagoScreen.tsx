import { Text } from 'react-native';

import Badge from '@/components/Badge';
import Tarjeta from '@/components/Tarjeta';
import { ContenedorPantalla } from '@/shared/components/contenedor-pantalla/ContenedorPantalla';

export function PagoScreen() {
  return (
    <ContenedorPantalla titulo="Pago">
      <Badge text="EN MESA" className="mt-4" />
      <Text className="mt-3 font-roboto text-base leading-6 text-texto/70">
        El pedido se paga en el restaurante. Puedes guardar una tarjeta en tu perfil para agilizar
        la cuenta.
      </Text>

      <Tarjeta className="mt-8 gap-3">
        <Badge text="MEDIOS" variant="sello" />
        <Text className="font-roboto text-base text-marca-oscura">Efectivo</Text>
        <Text className="font-roboto text-base text-marca-oscura">Tarjeta débito o crédito</Text>
        <Text className="font-roboto text-base text-marca-oscura">Transferencia</Text>
      </Tarjeta>
    </ContenedorPantalla>
  );
}
