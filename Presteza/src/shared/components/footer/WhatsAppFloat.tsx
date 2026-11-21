import { usePathname } from 'expo-router';
import { Linking, Pressable } from 'react-native';

import { useSession } from '@/session/context';
import { esRepartidor } from '@/session/roles';

import { Icono } from './Icono';

const TELEFONO_WHATSAPP = '573104941839';

export function WhatsAppFloat() {
  const ruta = usePathname();
  const { user } = useSession();
  if (
    esRepartidor(user) ||
    ruta.includes('perfil') ||
    ruta.includes('admin') ||
    ruta.includes('plato') ||
    ruta.includes('seguimiento') ||
    ruta.includes('repartidor')
  ) {
    return null;
  }

  return (
    <Pressable
      onPress={() => Linking.openURL(`https://wa.me/${TELEFONO_WHATSAPP}`)}
      accessibilityRole="button"
      accessibilityLabel="Escribir por WhatsApp"
      className="absolute bottom-6 right-6 z-50 h-14 w-14 items-center justify-center rounded-full bg-whatsapp shadow-md active:scale-105 active:bg-whatsapp-oscuro">
      <Icono name="whatsapp" size={28} className="text-white" />
    </Pressable>
  );
}
