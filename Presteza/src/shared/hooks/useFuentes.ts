import {
  Roboto_300Light,
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_600SemiBold,
  Roboto_700Bold,
  Roboto_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/roboto';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

// Se mantiene la pantalla de carga hasta que Roboto esté disponible, para que
// la app no aparezca un instante con la fuente del sistema.
SplashScreen.preventAutoHideAsync().catch(() => {});

export function useFuentes() {
  const [cargadas, error] = useFonts({
    Roboto_300Light,
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_600SemiBold,
    Roboto_700Bold,
    Roboto_800ExtraBold,
  });

  const listo = cargadas || error !== null;

  useEffect(() => {
    if (listo) SplashScreen.hideAsync().catch(() => {});
  }, [listo]);

  // Si alguna fuente falla se continúa con la del sistema en vez de dejar la
  // app bloqueada en la pantalla de carga.
  return listo;
}
