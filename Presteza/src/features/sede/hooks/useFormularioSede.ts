import { router } from 'expo-router';
import { Linking } from 'react-native';

import { useFormulario } from '@/shared/hooks/useFormulario';

import { SEDE } from '../data';

type VisitaSede = {
  nombre: string;
  personas: string;
};

export function useFormularioSede() {
  const { control, handleSubmit } = useFormulario<VisitaSede>({ nombre: '', personas: '' });

  return {
    control,
    reservar: handleSubmit(() => {
      router.push('/reservas');
    }),
    verMenu: () => router.push('/menu'),
    llamar: () => void Linking.openURL(`tel:${SEDE.telefono}`),
  };
}
