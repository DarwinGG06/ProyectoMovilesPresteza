import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { sillasIsometricas, tamanoMesa3D } from '../data';
import { useAlzaMesa } from '../hooks/useAlzaMesa';
import type { MesaVisual } from '../types';

type Mesa3DProps = {
  mesa: MesaVisual;
  seleccionada: boolean;
  onPress: () => void;
};

export function Mesa3D({ mesa, seleccionada, onPress }: Mesa3DProps) {
  const estilo = useAlzaMesa(seleccionada);

  const tam = tamanoMesa3D(mesa.capacity);
  const ocupada = !mesa.available;
  const escala = 0.78 + (mesa.y / 100) * 0.3;
  const altoTapa = tam.top * tam.squash;
  const sillas = sillasIsometricas(mesa.capacity, tam.top * 0.68, altoTapa * 0.95);
  const madera = ocupada
    ? (['#7a3d45', '#3d181e'] as const)
    : seleccionada
      ? (['#fff1c4', '#8b2d4f'] as const)
      : (['#f6e2b8', '#b07a3c'] as const);

  return (
    <Pressable
      onPress={onPress}
      disabled={ocupada}
      style={[
        estilos.ancla,
        {
          left: `${mesa.x}%`,
          top: `${mesa.y}%`,
          zIndex: Math.round(mesa.y) + (seleccionada ? 50 : 0),
          transform: [{ scale: escala }],
        },
      ]}>
      <Animated.View style={[estilos.cuerpo, estilo]}>
        <View
          style={[
            estilos.sombra,
            {
              width: tam.top * 1.35,
              height: altoTapa * 1.05,
              marginLeft: -(tam.top * 1.35) / 2,
              backgroundColor: seleccionada ? 'rgba(212,175,119,0.45)' : 'rgba(0,0,0,0.55)',
            },
          ]}
        />

        {sillas
          .filter((silla) => silla.atras)
          .map((silla, index) => (
            <Silla3D
              key={`atras-${index}`}
              x={silla.x}
              y={silla.y}
              ocupada={ocupada}
              seleccionada={seleccionada}
            />
          ))}

        <View style={estilos.pie}>
          <LinearGradient colors={['#d7b06a', '#7a5420']} style={estilos.relleno} />
        </View>
        <View style={estilos.columna}>
          <LinearGradient colors={['#e8c888', '#8a6230']} style={estilos.relleno} />
        </View>

        <View
          style={[
            estilos.frente,
            {
              width: tam.top,
              marginLeft: -tam.top / 2,
              top: 26 + altoTapa - 2,
            },
          ]}>
          <LinearGradient
            colors={ocupada ? ['#4a1c22', '#2a1014'] : ['#7a4a1c', '#4a2a10']}
            style={estilos.relleno}
          />
        </View>

        <View
          style={[
            estilos.tapa,
            {
              width: tam.top,
              height: altoTapa,
              borderRadius: tam.top,
              marginLeft: -tam.top / 2,
              borderColor: seleccionada ? '#fff6d2' : ocupada ? '#8a3d46' : '#1a070f',
              borderWidth: 3,
            },
          ]}>
          <LinearGradient
            colors={[...madera]}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.85, y: 1 }}
            style={estilos.relleno}
          />
          <View style={estilos.brillo} />
          <View style={[estilos.plato, ocupada && estilos.platoOcupado]} />
          {ocupada ? null : <View style={[estilos.llama, seleccionada && estilos.llamaAlta]} />}
          <Text style={estilos.numero} className="font-roboto">
            {mesa.id}
          </Text>
          <Text style={estilos.capacidad} className="font-roboto">
            {mesa.capacity}
          </Text>
        </View>

        {sillas
          .filter((silla) => !silla.atras)
          .map((silla, index) => (
            <Silla3D
              key={`frente-${index}`}
              x={silla.x}
              y={silla.y}
              ocupada={ocupada}
              seleccionada={seleccionada}
            />
          ))}

        {ocupada ? (
          <View style={estilos.sello}>
            <Text style={estilos.textoSello} className="font-roboto">
              OCUPADA
            </Text>
          </View>
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

function Silla3D({
  x,
  y,
  ocupada,
  seleccionada,
}: {
  x: number;
  y: number;
  ocupada: boolean;
  seleccionada: boolean;
}) {
  return (
    <View style={[estilos.silla, { marginLeft: x - 9, marginTop: y - 4, zIndex: y > 2 ? 8 : 1 }]}>
      <View
        style={[
          estilos.respaldo,
          { backgroundColor: ocupada ? '#5a2a30' : seleccionada ? '#6b1d3d' : '#3d2218' },
        ]}
      />
      <View style={estilos.asiento}>
        <LinearGradient
          colors={
            ocupada
              ? ['#8a454c', '#5a2a30']
              : seleccionada
                ? ['#a34468', '#6b1d3d']
                : ['#a56a40', '#6a4024']
          }
          style={estilos.relleno}
        />
      </View>
      <View style={estilos.pieSilla} />
    </View>
  );
}

const estilos = StyleSheet.create({
  ancla: {
    position: 'absolute',
    width: 130,
    height: 110,
    marginLeft: -65,
    marginTop: -55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cuerpo: {
    width: 130,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sombra: {
    position: 'absolute',
    left: '50%',
    top: 64,
    borderRadius: 80,
  },
  pie: {
    position: 'absolute',
    top: 58,
    width: 28,
    height: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  columna: {
    position: 'absolute',
    top: 40,
    width: 10,
    height: 22,
    borderRadius: 3,
    overflow: 'hidden',
  },
  frente: {
    position: 'absolute',
    left: '50%',
    height: 13,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
  },
  tapa: {
    position: 'absolute',
    left: '50%',
    top: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  relleno: {
    ...StyleSheet.absoluteFillObject,
  },
  brillo: {
    position: 'absolute',
    top: 3,
    left: '18%',
    right: '28%',
    height: '28%',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  plato: {
    position: 'absolute',
    width: 18,
    height: 8,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: 'rgba(255,255,255,0.14)',
    top: 5,
  },
  platoOcupado: {
    borderColor: 'rgba(255,180,180,0.2)',
    backgroundColor: 'rgba(80,20,28,0.3)',
  },
  llama: {
    position: 'absolute',
    top: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffe08a',
    shadowColor: '#ffb347',
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  llamaAlta: {
    width: 8,
    height: 8,
    backgroundColor: '#fff6d2',
    shadowRadius: 12,
  },
  numero: {
    color: '#2a0818',
    fontSize: 11,
    fontFamily: 'Roboto_800ExtraBold',
    letterSpacing: 0.4,
    marginTop: 8,
  },
  capacidad: {
    color: 'rgba(42,8,24,0.7)',
    fontSize: 8,
    fontFamily: 'Roboto_700Bold',
  },
  silla: {
    position: 'absolute',
    left: '50%',
    top: 34,
    alignItems: 'center',
  },
  respaldo: {
    width: 11,
    height: 13,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    marginBottom: -3,
  },
  asiento: {
    width: 18,
    height: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  pieSilla: {
    width: 4,
    height: 6,
    borderRadius: 1,
    backgroundColor: '#c4a36a',
    marginTop: -1,
  },
  sello: {
    position: 'absolute',
    top: 10,
    backgroundColor: '#9b2c3a',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f2c9c9',
    transform: [{ rotate: '-8deg' }],
  },
  textoSello: {
    color: '#fff',
    fontSize: 7,
    fontFamily: 'Roboto_800ExtraBold',
    letterSpacing: 0.6,
  },
});
