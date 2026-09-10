import { useEffect } from 'react';
import { router } from 'expo-router';
import { Dimensions, Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { CATEGORIAS } from '../data';
import { MarcaCurso, Plato } from './MesaDecor';

const ANCHO = Dimensions.get('window').width;
const LIENZO = Math.min(ANCHO - 16, 368);
const CX = LIENZO / 2;
const CY = LIENZO / 2;
const RADIO = LIENZO * 0.33;
const TAM = 74;
const CENTRO = 108;

export function CategoriasInicio() {
  const giro = useSharedValue(0);

  useEffect(() => {
    giro.value = withRepeat(withTiming(360, { duration: 48000, easing: Easing.linear }), -1, false);
  }, [giro]);

  return (
    <View className="bg-marca-oscura px-5 pb-12">
      <MarcaCurso numero="III" nombre="NUESTRA CARTA" />
      <Text className="mb-5 text-sm text-crema/55">Elige una categoría y entra al menú.</Text>

      <View className="items-center">
        <View style={{ width: LIENZO, height: LIENZO + 28 }}>
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: CX - RADIO,
              top: CY - RADIO,
              width: RADIO * 2,
              height: RADIO * 2,
              borderRadius: RADIO,
              borderWidth: 1,
              borderColor: 'rgba(212,175,119,0.45)',
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: CX - RADIO * 0.62,
              top: CY - RADIO * 0.62,
              width: RADIO * 1.24,
              height: RADIO * 1.24,
              borderRadius: RADIO,
              borderWidth: 1,
              borderColor: 'rgba(212,175,119,0.18)',
            }}
          />

          {CATEGORIAS.map((categoria, index) => (
            <RadioOro key={`radio-${categoria.id}`} index={index} giro={giro} />
          ))}

          <PuntoOrbita giro={giro} />

          {CATEGORIAS.map((categoria, index) => (
            <Satelite key={categoria.id} categoria={categoria} index={index} giro={giro} />
          ))}

          <Pressable
            onPress={() => router.push('/menu')}
            className="absolute items-center justify-center rounded-full bg-marca"
            style={{
              width: CENTRO,
              height: CENTRO,
              left: CX - CENTRO / 2,
              top: CY - CENTRO / 2,
              borderWidth: 1.5,
              borderColor: '#d4af77',
            }}>
            <View
              className="items-center justify-center rounded-full"
              style={{
                width: CENTRO - 14,
                height: CENTRO - 14,
                borderWidth: 1,
                borderColor: 'rgba(212,175,119,0.35)',
              }}>
              <Text className="text-[10px] tracking-[3px] text-oro">MENÚ</Text>
              <Text className="text-xl font-light text-crema">Carta</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function RadioOro({
  index,
  giro,
}: {
  index: number;
  giro: Animated.SharedValue<number>;
}) {
  const base = (index / CATEGORIAS.length) * 360 - 90;

  const estilo = useAnimatedStyle(() => ({
    transform: [{ rotate: `${base + giro.value}deg` }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: CX,
          top: CY,
          width: RADIO,
          height: 1,
          backgroundColor: 'rgba(212,175,119,0.28)',
          transformOrigin: 'left center',
        },
        estilo,
      ]}
    />
  );
}

function PuntoOrbita({ giro }: { giro: Animated.SharedValue<number> }) {
  const estilo = useAnimatedStyle(() => {
    const rad = ((giro.value - 90) * Math.PI) / 180;
    return {
      left: CX + Math.cos(rad) * RADIO - 4,
      top: CY + Math.sin(rad) * RADIO - 4,
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: '#d4af77',
        },
        estilo,
      ]}
    />
  );
}

function Satelite({
  categoria,
  index,
  giro,
}: {
  categoria: (typeof CATEGORIAS)[number];
  index: number;
  giro: Animated.SharedValue<number>;
}) {
  const base = (index / CATEGORIAS.length) * Math.PI * 2 - Math.PI / 2;

  const estilo = useAnimatedStyle(() => {
    const rad = base + (giro.value * Math.PI) / 180;
    return {
      left: CX + Math.cos(rad) * RADIO - (TAM + 10) / 2,
      top: CY + Math.sin(rad) * RADIO - TAM / 2,
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: TAM + 10,
          alignItems: 'center',
        },
        estilo,
      ]}>
      <Pressable onPress={() => router.push('/menu')}>
        <Plato uri={categoria.imageUrl} size={TAM} />
        <Text className="mt-1 text-center text-[11px] tracking-[1px] text-crema">{categoria.name}</Text>
      </Pressable>
    </Animated.View>
  );
}
