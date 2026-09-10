export const VALORES = [
  {
    icono: 'ribbon-outline' as const,
    titulo: '100% Calidad',
    texto:
      'Escogimos la mejor carne para nuestros productos, haciéndolos únicos, jugosos y exquisitos al paladar.',
  },
  {
    icono: 'sparkles-outline' as const,
    titulo: 'Ingredientes Premium',
    texto:
      'Cada ingrediente es cuidadosamente seleccionado por un personal altamente capacitado para garantizar la mejor calidad.',
  },
  {
    icono: 'trophy-outline' as const,
    titulo: 'Reconocimiento Local',
    texto:
      'En poco tiempo logramos posicionar nuestra marca y obtener reconocimientos locales por nuestra excelencia y dedicación.',
  },
];

export const PRODUCTOS_DESTACADOS = [
  {
    id: '1',
    name: 'Hamburguesa Presteza',
    description: 'Carne jugosa, pan artesanal y nuestra salsa de la casa.',
    price: 28000,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
    badge: 'Más popular',
  },
  {
    id: '6',
    name: 'Bowl de la Casa',
    description: 'Ingredientes frescos, color y un equilibrio pensado para el día.',
    price: 24000,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
    badge: 'Especial',
  },
  {
    id: '30',
    name: 'Postre del Chef',
    description: 'El cierre dulce que no puedes dejar pasar.',
    price: 14000,
    imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=80',
    badge: 'Recomendado',
  },
];

export const CATEGORIAS = [
  {
    id: 'desayunos',
    name: 'Desayunos',
    description: 'Empieza el día con sabor',
    icono: 'sunny-outline' as const,
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=80',
  },
  {
    id: 'almuerzos',
    name: 'Almuerzos',
    description: 'Platos que llenan y emocionan',
    icono: 'restaurant-outline' as const,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
  },
  {
    id: 'hamburguesas',
    name: 'Hamburguesas',
    description: 'Jugosas, únicas y nuestras',
    icono: 'fast-food-outline' as const,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
  },
  {
    id: 'ensaladas',
    name: 'Ensaladas',
    description: 'Frescura en cada tenedor',
    icono: 'leaf-outline' as const,
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
  },
  {
    id: 'postres',
    name: 'Postres',
    description: 'El final que se queda',
    icono: 'ice-cream-outline' as const,
    imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=80',
  },
];

export const ESTADISTICAS = [
  { icono: 'people-outline' as const, valor: 5000, sufijo: '+', etiqueta: 'Clientes satisfechos', max: 5000 },
  { icono: 'cafe-outline' as const, valor: 100, sufijo: '+', etiqueta: 'Platos en carta', max: 120 },
  { icono: 'star-outline' as const, valor: 4.9, sufijo: '', etiqueta: 'Calificación', max: 5 },
  { icono: 'time-outline' as const, valor: 5, sufijo: '', etiqueta: 'Años en Manizales', max: 8 },
];
