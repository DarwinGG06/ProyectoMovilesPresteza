import { useCallback } from 'react';
import { Linking } from 'react-native';

import { INSTALACIONES, SEDE } from '../data';

export function useSede() {
  const abrirMapa = useCallback(() => {
    void Linking.openURL(SEDE.mapaLink);
  }, []);

  return { sede: SEDE, instalaciones: INSTALACIONES, abrirMapa };
}
