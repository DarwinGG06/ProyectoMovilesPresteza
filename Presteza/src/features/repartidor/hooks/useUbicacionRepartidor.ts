import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';

import { publicarUbicacion } from '@/api/repartidor';
import { useSession } from '@/session/context';
import type { PuntoMapa } from '@/shared/components/mapa/htmlMapaRuta';

/** Envío al servidor cada 3 s para que el cliente vea el punto casi en vivo. */
const CADA_MS = 3000;

export function useUbicacionRepartidor(pedidosEnCamino: string[]) {
  const { token } = useSession();
  const [conectado, setConectado] = useState(false);
  const [punto, setPunto] = useState<PuntoMapa | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const idsRef = useRef(pedidosEnCamino);
  const tokenRef = useRef(token);
  const puntoRef = useRef<PuntoMapa | null>(null);
  const ultimoEnvio = useRef(0);
  const avisoRed = useRef(false);
  const idsClave = pedidosEnCamino.join(',');

  idsRef.current = pedidosEnCamino;
  tokenRef.current = token;

  const anotar = (siguiente: PuntoMapa) => {
    puntoRef.current = siguiente;
    setPunto(siguiente);
  };

  const compartir = (siguiente: PuntoMapa, forzar = false) => {
    const jwt = tokenRef.current;
    const ids = idsRef.current;
    if (!jwt || !ids.length) return;
    const ahora = Date.now();
    if (!forzar && ahora - ultimoEnvio.current < CADA_MS) return;
    ultimoEnvio.current = ahora;
    void Promise.all(ids.map((id) => publicarUbicacion(jwt, id, siguiente)))
      .then(() => {
        avisoRed.current = false;
        setAviso((prev) => (prev?.includes('servidor') ? null : prev));
      })
      .catch(() => {
        if (avisoRed.current) return;
        avisoRed.current = true;
        setAviso('Tu punto se ve aquí. El cliente lo verá cuando subas el servidor.');
      });
  };

  const compartirRef = useRef(compartir);
  const anotarRef = useRef(anotar);
  compartirRef.current = compartir;
  anotarRef.current = anotar;

  useEffect(() => {
    if (!conectado) return;

    let sub: Location.LocationSubscription | null = null;
    let pulso: ReturnType<typeof setInterval> | null = null;
    let vivo = true;

    void (async () => {
      const permiso = await Location.requestForegroundPermissionsAsync();
      if (!vivo) return;
      if (permiso.status !== 'granted') {
        setAviso('Activa la ubicación del teléfono para compartir la ruta.');
        setConectado(false);
        return;
      }

      const actual = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      if (!vivo) return;
      const inicio = { lat: actual.coords.latitude, lng: actual.coords.longitude };
      anotarRef.current(inicio);
      compartirRef.current(inicio, true);

      sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2500,
          distanceInterval: 5,
        },
        (lectura) => {
          const siguiente = {
            lat: lectura.coords.latitude,
            lng: lectura.coords.longitude,
          };
          anotarRef.current(siguiente);
          compartirRef.current(siguiente);
        },
      );

      // Si el GPS se queda quieto, igual reenvía el último punto.
      pulso = setInterval(() => {
        const ultimo = puntoRef.current;
        if (ultimo) compartirRef.current(ultimo, true);
      }, CADA_MS);
    })().catch(() => {
      if (!vivo) return;
      setAviso('No se pudo leer la ubicación.');
      setConectado(false);
    });

    return () => {
      vivo = false;
      sub?.remove();
      if (pulso) clearInterval(pulso);
    };
  }, [conectado]);

  useEffect(() => {
    if (!conectado || !idsClave) return;
    const siguiente = puntoRef.current;
    if (!siguiente) return;
    compartirRef.current(siguiente, true);
  }, [conectado, idsClave]);

  // Si ya hay un domicilio en camino, enciende solo el GPS.
  useEffect(() => {
    if (idsClave && !conectado) setConectado(true);
  }, [conectado, idsClave]);

  return {
    conectado,
    punto: conectado ? punto : null,
    aviso,
    conectar: () => setConectado(true),
    cambiar: setConectado,
  };
}
