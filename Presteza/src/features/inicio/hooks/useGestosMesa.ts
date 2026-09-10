import { useMemo, useRef } from 'react';
import { PanResponder, type GestureResponderEvent, type PanResponderGestureState } from 'react-native';
import { runOnJS, useSharedValue, withDecay, withSpring } from 'react-native-reanimated';

function angulo(pageX: number, pageY: number, cx: number, cy: number) {
  return Math.atan2(pageY - cy, pageX - cx);
}

function normalizar(delta: number) {
  if (delta > Math.PI) return delta - Math.PI * 2;
  if (delta < -Math.PI) return delta + Math.PI * 2;
  return delta;
}

type GiroOpciones = {
  inercia?: boolean;
  alSoltar?: (grados: number, velocidad: number) => void;
};

export function useGiro(opciones?: GiroOpciones) {
  const rotacion = useSharedValue(0);
  const centro = useRef({ x: 0, y: 0 });
  const ultimo = useRef(0);
  const velocidad = useRef(0);
  const tiempo = useRef(0);
  const alSoltarRef = useRef(opciones?.alSoltar);
  const inerciaRef = useRef(opciones?.inercia !== false);

  alSoltarRef.current = opciones?.alSoltar;
  inerciaRef.current = opciones?.inercia !== false;

  const avisar = (grados: number, vel: number) => {
    alSoltarRef.current?.(grados, vel);
  };

  const medir = (x: number, y: number, ancho: number, alto: number) => {
    centro.current = { x: x + ancho / 2, y: y + alto / 2 };
  };

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (evento: GestureResponderEvent) => {
          ultimo.current = angulo(evento.nativeEvent.pageX, evento.nativeEvent.pageY, centro.current.x, centro.current.y);
          tiempo.current = Date.now();
          velocidad.current = 0;
        },
        onPanResponderMove: (evento: GestureResponderEvent) => {
          const actual = angulo(evento.nativeEvent.pageX, evento.nativeEvent.pageY, centro.current.x, centro.current.y);
          const delta = normalizar(actual - ultimo.current);
          const ahora = Date.now();
          const dt = Math.max(ahora - tiempo.current, 1) / 1000;
          velocidad.current = ((delta * 180) / Math.PI) / dt;
          tiempo.current = ahora;
          ultimo.current = actual;
          rotacion.value += (delta * 180) / Math.PI;
        },
        onPanResponderRelease: () => {
          const vel = velocidad.current;

          if (!inerciaRef.current) {
            avisar(rotacion.value, vel);
            return;
          }

          rotacion.value = withDecay({ velocity: vel, deceleration: 0.994 }, (listo) => {
            if (listo) {
              runOnJS(avisar)(rotacion.value, vel);
            }
          });
        },
      }),
    [rotacion],
  );

  return { rotacion, responder, medir };
}

export function useArrastre() {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const rotacion = useSharedValue(0);
  const escala = useSharedValue(1);
  const vel = useRef(0);

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          escala.value = withSpring(1.08);
        },
        onPanResponderMove: (_evento: GestureResponderEvent, gesto: PanResponderGestureState) => {
          x.value = gesto.dx;
          y.value = gesto.dy;
          rotacion.value = gesto.dx * 0.45;
          vel.current = gesto.vx * 220;
        },
        onPanResponderRelease: () => {
          escala.value = withSpring(1);
          x.value = withSpring(0, { damping: 14, stiffness: 140 });
          y.value = withSpring(0, { damping: 14, stiffness: 140 });
          rotacion.value = withDecay({ velocity: vel.current, deceleration: 0.991 });
        },
      }),
    [escala, rotacion, x, y],
  );

  return { x, y, rotacion, escala, responder };
}
