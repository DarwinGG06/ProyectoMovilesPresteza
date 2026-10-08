import { SEDE } from '@/features/sede/data';

export const HERO_CONTACTO =
  'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=1400&q=80';

export const WHATSAPP = {
  nombre: 'WhatsApp Presteza',
  telefono: SEDE.telefono,
  url: `https://wa.me/57${SEDE.telefono}`,
};

export const CONTACTO = {
  telefono: SEDE.telefono,
  email: SEDE.email,
  direccion: SEDE.direccionCompleta,
  semana: SEDE.semana,
  finDeSemana: SEDE.finDeSemana,
  mapa: SEDE.mapaLink,
};
