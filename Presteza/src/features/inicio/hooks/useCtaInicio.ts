import { router, type Href } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Linking } from 'react-native';

import { useSession } from '@/session/context';
import { esAdmin } from '@/session/roles';
import { rutaReservaRapida } from '@/shared/validacion';

export type ReservaRapida = {
  nombre: string;
  personas: string;
};

export function useCtaInicio() {
  const { user } = useSession();
  const { control, handleSubmit } = useForm<ReservaRapida>({
    defaultValues: { nombre: '', personas: '' },
  });

  const reservar = handleSubmit((datos) => {
    if (esAdmin(user)) return;
    router.push(rutaReservaRapida(datos.nombre, datos.personas) as Href);
  });

  const verMenu = () => {
    router.push('/home/menu');
  };

  const llamar = () => {
    Linking.openURL('tel:3104941839');
  };

  return { control, reservar, verMenu, llamar, esAdmin: esAdmin(user) };
}
