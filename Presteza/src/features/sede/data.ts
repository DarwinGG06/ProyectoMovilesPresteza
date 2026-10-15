import { COORDENADAS_SEDE, urlMapaComoLlegar, urlMapaVer } from './mapa';

export const SEDE = {
  nombre: 'Presteza — Sede principal',
  direccion: 'Carrera 23 # 70B-57',
  direccionCompleta:
    'Carrera 23 # 70B-57 Av. Santander, Torre Plaza 70 Piso 2 Local 8, Milán, Manizales, Caldas',
  ciudad: 'Manizales, Caldas',
  telefono: '3104941839',
  email: 'contacto@presteza.com',
  semana: 'Lunes a viernes · 11:00 a. m. – 10:00 p. m.',
  finDeSemana: 'Sábados y domingos · 12:00 m. – 11:00 p. m.',
  foto: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&q=80',
  fotoCalle: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
  fotoMesa: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
  lat: COORDENADAS_SEDE.lat,
  lng: COORDENADAS_SEDE.lng,
  mapaLink: urlMapaVer(COORDENADAS_SEDE.lat, COORDENADAS_SEDE.lng),
  mapaComoLlegar: urlMapaComoLlegar(COORDENADAS_SEDE.lat, COORDENADAS_SEDE.lng),
};

export const INSTALACIONES = [
  { icono: 'people-outline' as const, titulo: 'Familia' },
  { icono: 'wifi-outline' as const, titulo: 'WiFi' },
  { icono: 'car-outline' as const, titulo: 'Parqueadero' },
];
