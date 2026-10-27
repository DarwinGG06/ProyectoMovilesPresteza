import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Linking } from 'react-native';

import { useSession } from '@/session/context';
import { esAdmin } from '@/session/roles';

export type ReservaRapida = {
  nombre: string;
  personas: string;
};

export function useCtaInicio() {
  const { user } = useSession();
  const { control, handleSubmit } = useForm<ReservaRapida>({
    defaultValues: { nombre: '', personas: '' },
  });

  const reservar = handleSubmit(() => {
    if (esAdmin(user)) return;
    router.push('/home/reservas');
  });

  const verMenu = () => {
    router.push('/home/menu');
  };

  const llamar = () => {
    Linking.openURL('tel:3104941839');
  };

  return { control, reservar, verMenu, llamar, esAdmin: esAdmin(user) };
}
