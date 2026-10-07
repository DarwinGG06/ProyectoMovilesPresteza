import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Linking } from 'react-native';

export type ReservaRapida = {
  nombre: string;
  personas: string;
};

export function useCtaInicio() {
  const { control, handleSubmit } = useForm<ReservaRapida>({
    defaultValues: { nombre: '', personas: '' },
  });

  const reservar = handleSubmit(() => {
    router.push('/reservas');
  });

  const verMenu = () => {
    router.push('/menu');
  };

  const llamar = () => {
    Linking.openURL('tel:3104941839');
  };

  return { control, reservar, verMenu, llamar };
}
