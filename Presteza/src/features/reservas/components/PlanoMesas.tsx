import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { IconoNav } from '@/shared/components/nav-bar/IconoNav';

import type { MesaVisual } from '../types';
import { LeyendaMesas } from './LeyendaMesas';
import { Mesa3D } from './Mesa3D';

type PlanoMesasProps = {
  mesas: MesaVisual[];
  mesaId?: string;
  barra: boolean;
  personalizada: boolean;
  onMesa: (mesa: MesaVisual) => void;
  onBarra: () => void;
  onPersonalizada: () => void;
};

export function PlanoMesas({
  mesas,
  mesaId,
  barra,
  personalizada,
  onMesa,
  onBarra,
  onPersonalizada,
}: PlanoMesasProps) {
  const ordenadas = [...mesas].sort((a, b) => a.y - b.y);

  return (
    <View className="overflow-hidden rounded-[28px] border border-oro/35">
      <LinearGradient colors={['#2a0818', '#14040c']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View className="px-4 pt-5">
          <Text className="text-center text-[10px] tracking-[4px] text-oro">SALÓN NOCTURNO</Text>
          <Text className="mt-1 text-center text-2xl font-light tracking-[1px] text-crema">Elige tu mesa</Text>
          <Text className="mb-3 mt-1 text-center text-sm text-crema/55">
            Un comedor en volumen. Toca la mesa que quieres.
          </Text>
          <LeyendaMesas />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.scroll}>
          <View style={estilos.salon}>
            <FondoEscena />

            <View style={estilos.cocina} pointerEvents="none">
              <LinearGradient colors={['#5a2040', '#2a0818']} style={estilos.arco}>
                <IconoNav name="flame" size={14} color="#d4af77" />
                <Text style={estilos.textoZona}>COCINA</Text>
              </LinearGradient>
              <View style={estilos.brasa} />
            </View>

            <Pressable onPress={onBarra} style={[estilos.barra, barra && estilos.alzada]}>
              <View style={estilos.sombraBarra} />
              <View style={estilos.baseBarra} />
              <LinearGradient
                colors={barra ? ['#f0d59a', '#6b1d3d'] : ['#e8c48a', '#9a6a38']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={estilos.tapaBarra}>
                <View style={estilos.botellas}>
                  <View style={estilos.botella} />
                  <View style={[estilos.botella, estilos.botellaAlta]} />
                  <View style={estilos.botella} />
                </View>
                <Text style={estilos.textoBarra}>BARRA</Text>
                <Text style={estilos.subBarra}>1+ personas</Text>
              </LinearGradient>
              <View style={estilos.banquetas}>
                {Array.from({ length: 5 }, (_, index) => (
                  <View key={index} style={estilos.banqueta} />
                ))}
              </View>
            </Pressable>

            <Pressable
              onPress={onPersonalizada}
              style={[estilos.atelier, personalizada && estilos.alzada]}>
              <View style={estilos.sombraAtelier} />
              <View style={estilos.cantoAtelier} />
              <LinearGradient
                colors={personalizada ? ['#fff1c2', '#8b2d4f'] : ['#ffe08a', '#d4a017']}
                style={estilos.tapaAtelier}>
                <IconoNav name="sparkles" size={16} color="#2a0818" />
                <Text style={estilos.textoAtelier}>A TU MEDIDA</Text>
              </LinearGradient>
            </Pressable>

            {ordenadas.map((mesa) => (
              <Mesa3D
                key={mesa.id}
                mesa={mesa}
                seleccionada={mesaId === mesa.id}
                onPress={() => {
                  if (mesa.available) onMesa(mesa);
                }}
              />
            ))}

            <View style={estilos.entrada} pointerEvents="none">
              <View style={estilos.alfombra} />
              <Text style={estilos.textoZona}>ENTRADA</Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

function FondoEscena() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={estilos.faroIzq} />
      <View style={estilos.faroDer} />
      {Array.from({ length: 7 }, (_, index) => {
        const t = index / 6;
        return (
          <View
            key={index}
            style={[
              estilos.trazo,
              {
                top: 70 + index * 72,
                width: 220 + t * 360,
                opacity: 0.08 + t * 0.1,
              },
            ]}
          />
        );
      })}
      <LinearGradient colors={['transparent', 'rgba(212,175,119,0.16)', 'transparent']} style={estilos.nave} />
      <Text style={estilos.monograma}>P</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center', paddingBottom: 12 },
  salon: {
    width: 760,
    height: 620,
    marginHorizontal: 12,
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: '#1a070f',
  },
  faroIzq: {
    position: 'absolute',
    left: -40,
    top: 80,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(139,45,79,0.22)',
  },
  faroDer: {
    position: 'absolute',
    right: -20,
    top: 40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(212,175,119,0.12)',
  },
  trazo: {
    alignSelf: 'center',
    height: 1,
    backgroundColor: '#d4af77',
  },
  nave: {
    position: 'absolute',
    left: '42%',
    top: 40,
    bottom: 30,
    width: 70,
  },
  monograma: {
    position: 'absolute',
    alignSelf: 'center',
    top: '42%',
    left: '46%',
    fontSize: 86,
    fontWeight: '200',
    color: 'rgba(212,175,119,0.07)',
  },
  cocina: {
    position: 'absolute',
    top: 18,
    right: 22,
    alignItems: 'center',
    zIndex: 2,
  },
  arco: {
    width: 120,
    height: 54,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 8,
    gap: 2,
    borderWidth: 1,
    borderColor: 'rgba(212,175,119,0.35)',
  },
  brasa: {
    width: 70,
    height: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,140,60,0.35)',
    marginTop: 4,
  },
  textoZona: {
    color: '#d4af77',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  barra: {
    position: 'absolute',
    left: 18,
    top: 20,
    width: 250,
    height: 78,
    zIndex: 4,
  },
  sombraBarra: {
    position: 'absolute',
    left: 10,
    right: 10,
    top: 48,
    height: 18,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  baseBarra: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 36,
    height: 22,
    borderRadius: 8,
    backgroundColor: '#5a3a22',
  },
  tapaBarra: {
    height: 40,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#f3d7a4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  botellas: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, marginRight: 4 },
  botella: { width: 5, height: 12, borderRadius: 2, backgroundColor: '#2a0818' },
  botellaAlta: { height: 16, backgroundColor: '#6b1d3d' },
  textoBarra: { color: '#2a0818', fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  subBarra: { color: 'rgba(42,8,24,0.7)', fontSize: 9, fontWeight: '700' },
  banquetas: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: 16,
  },
  banqueta: {
    width: 16,
    height: 9,
    borderRadius: 8,
    backgroundColor: '#8a5a38',
    borderTopWidth: 3,
    borderTopColor: '#4a2a1c',
  },
  atelier: {
    position: 'absolute',
    top: 92,
    right: 28,
    width: 96,
    height: 80,
    alignItems: 'center',
    zIndex: 5,
  },
  sombraAtelier: {
    position: 'absolute',
    top: 48,
    width: 78,
    height: 22,
    borderRadius: 40,
    backgroundColor: 'rgba(212,175,119,0.28)',
  },
  cantoAtelier: {
    position: 'absolute',
    top: 28,
    width: 72,
    height: 36,
    borderRadius: 36,
    backgroundColor: '#9a6a10',
  },
  tapaAtelier: {
    width: 72,
    height: 36,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#fff3c4',
    gap: 1,
  },
  textoAtelier: { color: '#2a0818', fontSize: 7, fontWeight: '800', letterSpacing: 0.5 },
  alzada: { transform: [{ translateY: -6 }, { scale: 1.06 }] },
  entrada: {
    position: 'absolute',
    bottom: 10,
    right: 24,
    alignItems: 'center',
    zIndex: 2,
  },
  alfombra: {
    width: 54,
    height: 28,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: '#6b1d3d',
    borderWidth: 1,
    borderColor: '#d4af77',
    marginBottom: 4,
  },
});
