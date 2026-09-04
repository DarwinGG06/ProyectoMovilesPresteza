import { Linking, Pressable } from 'react-native';

import { Icono } from './Icono';

const TELEFONO_WHATSAPP = '573104941839';

export function WhatsAppFloat() {
  return (
    <Pressable
      onPress={() => Linking.openURL(`https://wa.me/${TELEFONO_WHATSAPP}`)}
      className="absolute bottom-6 right-6 z-50 h-14 w-14 items-center justify-center rounded-full bg-whatsapp shadow-md active:scale-105 active:bg-whatsapp-oscuro">
      <Icono name="whatsapp" size={28} className="text-white" />
    </Pressable>
  );
}
