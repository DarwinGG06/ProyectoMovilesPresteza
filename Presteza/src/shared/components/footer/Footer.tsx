import { Href, router } from 'expo-router';
import { Linking, Pressable, Text, View } from 'react-native';

import { Icono } from './Icono';
import { SelloP } from '@/shared/components/nav-bar/SelloP';

export type RutaFooter = '/' | '/contacto' | '/nosotros' | '/menu' | '/reservas' | '/sede';

type FooterProps = {
  facebookUrl?: string;
  instagramUrl?: string;
};

const ENLACES_RAPIDOS: { etiqueta: string; ruta: RutaFooter }[] = [
  { etiqueta: 'Inicio', ruta: '/' },
  { etiqueta: 'Contacto', ruta: '/contacto' },
  { etiqueta: 'Nosotros', ruta: '/nosotros' },
  { etiqueta: 'Menú', ruta: '/menu' },
  { etiqueta: 'Reservas', ruta: '/reservas' },
];

export function Footer({ facebookUrl, instagramUrl }: FooterProps) {
  return (
    <View className="bg-marca-oscura">
      <View className="h-1 bg-oro" />
      <View className="items-center px-8 pb-14 pt-10">
        <SelloP size="md" />
        <Text className="mt-4 text-2xl font-extrabold tracking-[6px] text-crema">PRESTEZA</Text>
        <Text className="mt-1 text-[11px] tracking-[3px] text-oro">COMIDA PARA TODOS</Text>
        <View className="my-6 h-px w-16 bg-oro/40" />

        <Text className="mb-3 text-[10px] tracking-[3px] text-oro">ACCESO RÁPIDO</Text>
        <View className="mb-8 flex-row flex-wrap justify-center gap-x-5 gap-y-2">
          {ENLACES_RAPIDOS.map((enlace) => (
            <Enlace key={enlace.ruta} onPress={() => router.push(enlace.ruta as Href)}>
              {enlace.etiqueta}
            </Enlace>
          ))}
        </View>

        <Text className="mb-2 text-[10px] tracking-[3px] text-oro">VISÍTANOS</Text>
        <Enlace onPress={() => router.push('/sede')}>Sede Manizales – Milán</Enlace>

        <View className="mt-8 flex-row gap-4">
          <IconoSocial nombre="facebook" url={facebookUrl} />
          <IconoSocial nombre="instagram" url={instagramUrl} />
        </View>
      </View>
    </View>
  );
}

function Enlace({ children, onPress }: { children: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} className="py-1">
      {({ pressed }) => (
        <Text className={`text-sm tracking-wide ${pressed ? 'text-oro' : 'text-crema/80'}`}>
          {children}
        </Text>
      )}
    </Pressable>
  );
}

function IconoSocial({
  nombre,
  url,
}: {
  nombre: 'facebook' | 'instagram';
  url?: string;
}) {
  return (
    <Pressable
      onPress={() => {
        if (url) Linking.openURL(url);
      }}
      className="h-11 w-11 items-center justify-center rounded-full border border-oro/40">
      <Icono name={nombre} size={18} className="text-oro" />
    </Pressable>
  );
}
