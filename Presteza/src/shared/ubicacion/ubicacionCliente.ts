import * as Location from 'expo-location';

import type { PuntoMapa } from '@/shared/components/mapa/htmlMapaRuta';

/** GPS del cliente para marcar la casita del domicilio con exactitud. */
export async function leerUbicacionCliente(): Promise<PuntoMapa> {
  const permiso = await Location.requestForegroundPermissionsAsync();
  if (permiso.status !== 'granted') {
    throw new Error('Activa la ubicación del teléfono para que el domicilio llegue exacto.');
  }

  const actual = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  const lat = actual.coords.latitude;
  const lng = actual.coords.longitude;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error('No se pudo leer tu ubicación. Inténtalo de nuevo.');
  }

  return { lat, lng };
}
