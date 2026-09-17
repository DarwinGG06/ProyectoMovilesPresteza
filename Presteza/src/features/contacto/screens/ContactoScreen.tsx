import { Text } from 'react-native';

import Badge from '@/components/Badge';
import Tarjeta from '@/components/Tarjeta';
import { ContenedorPantalla } from '@/shared/components/contenedor-pantalla/ContenedorPantalla';

export function ContactoScreen() {
  return (
    <ContenedorPantalla titulo="Contacto">
      <Badge text="MILÁN" className="mt-4" />
      <Text className="mt-3 text-base leading-6 text-texto/70">
        Estamos en el barrio Milán, Manizales. Escríbenos o reserva mesa desde la app.
      </Text>

      <Tarjeta className="mt-8 gap-4">
        <Badge text="WHATSAPP" variant="sello" />
        <Text className="text-lg font-semibold text-marca-oscura">310 494 1839</Text>
        <Text className="text-sm text-texto/70">El botón verde de la esquina también abre el chat.</Text>
      </Tarjeta>

      <Tarjeta className="mt-4 gap-2">
        <Badge text="CORREO" variant="sello" />
        <Text className="text-base text-marca-oscura">hola@presteza.com</Text>
      </Tarjeta>
    </ContenedorPantalla>
  );
}
