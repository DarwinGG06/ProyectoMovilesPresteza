import { type ComponentProps } from 'react';
import { Href, router } from 'expo-router';
import { Animated, Modal, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/session/context';
import { useEntradaEscalonada } from '@/shared/hooks/useEntradaEscalonada';

import { IconoNav } from './IconoNav';
import { SelloP } from './SelloP';

type NombreIcono = ComponentProps<typeof IconoNav>['name'];

const ENLACES: { etiqueta: string; ruta: Href; icono: NombreIcono; numero: string }[] = [
  { etiqueta: 'Inicio', ruta: '/', icono: 'home-outline', numero: '01' },
  { etiqueta: 'Menú', ruta: '/menu', icono: 'restaurant-outline', numero: '02' },
  { etiqueta: 'Nuestra Sede', ruta: '/sede', icono: 'location-outline', numero: '03' },
  { etiqueta: 'Nosotros', ruta: '/nosotros', icono: 'heart-outline', numero: '04' },
  { etiqueta: 'Contacto', ruta: '/contacto', icono: 'chatbubble-ellipses-outline', numero: '05' },
  { etiqueta: 'Reservas', ruta: '/reservas', icono: 'calendar-outline', numero: '06' },
];

type MenuDrawerProps = {
  visible: boolean;
  onClose: () => void;
};

export function MenuDrawer({ visible, onClose }: MenuDrawerProps) {
  const { user } = useSession();
  const enlaces = user?.role === 'admin'
    ? [...ENLACES, { etiqueta: 'Administración', ruta: '/home/admin' as Href, icono: 'speedometer-outline' as NombreIcono, numero: '07' }]
    : ENLACES;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-marca-oscura">
        <View className="absolute -right-24 top-20 h-72 w-72 rounded-full border-[40px] border-oro/10" />
        <View className="absolute -left-16 bottom-24 h-56 w-56 rounded-full bg-marca/50" />

        <SafeAreaView className="flex-1">
          <View className="flex-row items-center justify-between px-6 pt-4">
            <SelloP size="md" />
            <Pressable
              onPress={onClose}
              className="h-12 w-12 items-center justify-center rounded-full border border-oro/50">
              <IconoNav name="close" size={22} className="text-oro" />
            </Pressable>
          </View>

          <View className="mb-8 mt-6 px-6">
            <Text className="text-[11px] tracking-[4px] text-oro">CARTA DE NAVEGACIÓN</Text>
            <Text className="mt-1 text-4xl font-extrabold tracking-[6px] text-crema">PRESTEZA</Text>
            <View className="mt-3 h-px w-24 bg-oro" />
          </View>

          <View className="px-4">
            {enlaces.map((enlace, index) => (
              <EnlaceEditorial
                key={enlace.etiqueta}
                visible={visible}
                delay={index * 70}
                numero={enlace.numero}
                etiqueta={enlace.etiqueta}
                icono={enlace.icono}
                onPress={() => {
                  onClose();
                  router.push(enlace.ruta);
                }}
              />
            ))}
          </View>

          <Text className="mt-auto px-6 pb-8 text-center text-[11px] tracking-[3px] text-oro/70">
            COMIDA PARA TODOS · MANIZALES
          </Text>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function EnlaceEditorial({
  visible,
  delay,
  numero,
  etiqueta,
  icono,
  onPress,
}: {
  visible: boolean;
  delay: number;
  numero: string;
  etiqueta: string;
  icono: NombreIcono;
  onPress: () => void;
}) {
  const entrada = useEntradaEscalonada({ visible, delay, duracion: 420, desplazamiento: 24 });

  return (
    <Animated.View style={entrada}>
      <Pressable onPress={onPress} className="mb-1 flex-row items-center px-3 py-3.5">
        <Text className="w-10 text-xs font-bold tracking-widest text-oro">{numero}</Text>
        <Text className="flex-1 text-[26px] font-light tracking-wide text-crema">{etiqueta}</Text>
        <IconoNav name={icono} size={18} className="text-oro/80" />
      </Pressable>
      <View className="ml-12 h-px bg-oro/15" />
    </Animated.View>
  );
}
