import type { ComponentProps } from 'react';

import { IconoNav } from '@/shared/components/nav-bar/IconoNav';

type NombreIcono = ComponentProps<typeof IconoNav>['name'];

export const HERO_NOSOTROS =
  'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1400&q=80';

export const HISTORIA = {
  year: '2020',
  titulo: 'Nuestra Historia',
  texto:
    'Presteza nació de la pasión por crear experiencias gastronómicas únicas. Desde el primer día nos enfocamos en productos de alta calidad, ingredientes frescos y técnicas refinadas. Cada plato cuenta una historia. Somos el lugar donde los momentos especiales cobran vida.',
  hito: 'Empezamos con el sueño de compartir la mesa.',
  foto: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80',
};

export const VALORES_CASA: {
  icono: NombreIcono;
  titulo: string;
  texto: string;
}[] = [
  {
    icono: 'shield-checkmark-outline',
    titulo: 'Calidad',
    texto: 'Cada ingrediente se elige para que el plato llegue limpio y preciso a la mesa.',
  },
  {
    icono: 'heart-outline',
    titulo: 'Pasión',
    texto: 'El oficio se nota en el corte, en el fuego y en cómo se sirve.',
  },
  {
    icono: 'people-outline',
    titulo: 'Casa',
    texto: 'Recetas de familia, con un pulso actual. La mesa es para quedarse.',
  },
  {
    icono: 'trophy-outline',
    titulo: 'Excelencia',
    texto: 'La visita tiene que salir mejor que la anterior. Sin alarde.',
  },
];

export const FUNDADORES = [
  {
    nombre: 'Gustavo',
    rol: 'Fundador y chef',
    foto: 'https://api.dicebear.com/7.x/adventurer/png?seed=Gustavo&backgroundColor=b6e3f4,c0aede,d1d4f9',
  },
  {
    nombre: 'Angela',
    rol: 'Fundadora y directora',
    foto: 'https://api.dicebear.com/7.x/adventurer/png?seed=Angela&backgroundColor=ffd5dc,ffdfbf',
  },
];

export const MISION =
  'Ofrecer una mesa que se recuerde: ingredientes de primera, técnica clara y un servicio que no interrumpe. Cada visita debe sentirse cuidada.';

export const VISION =
  'Ser la casa a la que se vuelve en Manizales: por la carta, por la mesa y porque aquí se celebran las reuniones que importan.';
