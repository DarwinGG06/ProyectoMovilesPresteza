import { Href, router } from 'expo-router';
import { Linking, Pressable, Text, View } from 'react-native';

import { Icono } from './Icono';

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
    <View className="relative border-t border-linea bg-white">
      <View className="items-center px-6 py-10">
        <View className="mb-8 items-center">
          <Text className="mb-3 text-base font-bold text-texto">Acceso Rápido</Text>
          {ENLACES_RAPIDOS.map((enlace) => (
            <Enlace key={enlace.ruta} onPress={() => router.push(enlace.ruta as Href)}>
              {enlace.etiqueta}
            </Enlace>
          ))}
        </View>

        <View className="mb-8 items-center">
          <Text className="mb-3 text-base font-bold text-texto">Visítanos</Text>
          <Text className="mb-1 font-semibold text-texto">Nuestra Sede</Text>
          <Enlace onPress={() => router.push('/sede')}>Sede Manizales – Milán</Enlace>
        </View>

        <View className="items-center">
          <View className="mb-3 flex-row items-center gap-4">
            <IconoSocial nombre="facebook" url={facebookUrl} />
            <IconoSocial nombre="instagram" url={instagramUrl} />
          </View>
          <Text className="text-base font-bold text-texto">PRESTEZA</Text>
          <Text className="text-texto">COMIDA PARA TODOS</Text>
        </View>
      </View>
    </View>
  );
}

function Enlace({ children, onPress }: { children: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} className="py-1">
      {({ pressed }) => (
        <Text className={`text-base ${pressed ? 'text-marca' : 'text-black'}`}>{children}</Text>
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
        if (url) {
          Linking.openURL(url);
        }
      }}
      hitSlop={8}>
      {({ pressed }) => (
        <Icono name={nombre} size={24} className={pressed ? 'text-marca' : 'text-black'} />
      )}
    </Pressable>
  );
}
