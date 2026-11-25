import { router, type Href } from 'expo-router';
import { Linking } from 'react-native';

import { useFormulario } from '@/shared/hooks/useFormulario';
import { rutaReservaRapida } from '@/shared/validacion';

import { SEDE } from '../data';

type VisitaSede = {
  nombre: string;
  personas: string;
};

export function useFormularioSede() {
  const { control, handleSubmit } = useFormulario<VisitaSede>({ nombre: '', personas: '' });

  return {
    control,
    reservar: handleSubmit((datos) => {
      router.push(rutaReservaRapida(datos.nombre, datos.personas) as Href);
    }),
    verMenu: () => router.push('/home/menu'),
    llamar: () => void Linking.openURL(`tel:${SEDE.telefono}`),
  };
}
