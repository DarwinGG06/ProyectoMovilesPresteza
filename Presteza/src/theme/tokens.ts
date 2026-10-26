/** Decisiones de diseño. NativeWind las lee en `tailwind.config.js`. */
export const colores = {
  marca: '#6b1d3d',
  'marca-clara': '#8b2d4f',
  'marca-oscura': '#3a0c20',
  oro: '#d4af77',
  'oro-suave': '#d4af7788',
  crema: '#faf6f2',
  pergamino: '#f6f0e6',
  'pergamino-oscuro': '#ebe3d4',
  tinta: '#2a1810',
  madera: '#5c3d2e',
  texto: '#222222',
  linea: '#eee6dc',
  placeholder: '#a3a3a3',
  whatsapp: '#25d366',
  'whatsapp-oscuro': '#1ebc57',
} as const;

export const radios = {
  tarjeta: 20,
} as const;

export const sombras = {
  elevada: {
    shadowColor: colores['marca-oscura'],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  },
} as const;
