import { Href, router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { SelloP } from '@/shared/components/nav-bar/SelloP';

export type RutaFooter =
  '/' | '/home/contacto' | '/home/nosotros' | '/home/menu' | '/home/reservas' | '/home/sede';

const ENLACES_RAPIDOS: { etiqueta: string; ruta: RutaFooter }[] = [
  { etiqueta: 'Inicio', ruta: '/' },
  { etiqueta: 'Contacto', ruta: '/home/contacto' },
  { etiqueta: 'Nosotros', ruta: '/home/nosotros' },
  { etiqueta: 'Menú', ruta: '/home/menu' },
  { etiqueta: 'Reservas', ruta: '/home/reservas' },
];

export function Footer() {
  return (
    <View className="bg-marca-oscura">
      <View className="h-px bg-oro/50" />
      <View className="items-center px-8 pb-16 pt-12">
        <SelloP size="sm" />
        <Text className="mt-5 font-serif-light text-[28px] tracking-[8px] text-crema">
          PRESTEZA
        </Text>
        <Text className="mt-1 font-roboto text-[11px] tracking-[3px] text-oro">
          COMIDA PARA TODOS
        </Text>
        <View className="my-6 h-px w-16 bg-oro/40" />

        <Text className="mb-3 font-roboto text-[10px] tracking-[3px] text-oro">ACCESO RÁPIDO</Text>
        <View className="mb-8 flex-row flex-wrap justify-center gap-x-5 gap-y-2">
          {ENLACES_RAPIDOS.map((enlace) => (
            <Enlace key={enlace.ruta} onPress={() => router.push(enlace.ruta as Href)}>
              {enlace.etiqueta}
            </Enlace>
          ))}
        </View>

        <Text className="mb-2 font-roboto text-[10px] tracking-[3px] text-oro">VISÍTANOS</Text>
        <Enlace onPress={() => router.push('/home/sede')}>Sede Manizales – Milán</Enlace>
      </View>
    </View>
  );
}

function Enlace({ children, onPress }: { children: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} className="py-1">
      {({ pressed }) => (
        <Text
          className={`font-roboto text-sm tracking-wide ${pressed ? 'text-oro' : 'text-crema/80'}`}>
          {children}
        </Text>
      )}
    </Pressable>
  );
}
