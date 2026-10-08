import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

// Se mantiene la pantalla de carga hasta que Roboto esté disponible, para que
// la app no aparezca un instante con la fuente del sistema.
SplashScreen.preventAutoHideAsync().catch(() => {});

export function useFuentes() {
  const [cargadas, error] = useFonts({
    // Se apunta a cada archivo: importar el índice de `@expo-google-fonts/roboto`
    // mete los 18 pesos en el bundle y aquí solo se usan seis.
    Roboto_300Light: require('@expo-google-fonts/roboto/300Light/Roboto_300Light.ttf'),
    Roboto_400Regular: require('@expo-google-fonts/roboto/400Regular/Roboto_400Regular.ttf'),
    Roboto_500Medium: require('@expo-google-fonts/roboto/500Medium/Roboto_500Medium.ttf'),
    Roboto_600SemiBold: require('@expo-google-fonts/roboto/600SemiBold/Roboto_600SemiBold.ttf'),
    Roboto_700Bold: require('@expo-google-fonts/roboto/700Bold/Roboto_700Bold.ttf'),
    Roboto_800ExtraBold: require('@expo-google-fonts/roboto/800ExtraBold/Roboto_800ExtraBold.ttf'),
  });

  const listo = cargadas || error !== null;

  useEffect(() => {
    if (listo) SplashScreen.hideAsync().catch(() => {});
  }, [listo]);

  // Si alguna fuente falla se continúa con la del sistema en vez de dejar la
  // app bloqueada en la pantalla de carga.
  return listo;
}
