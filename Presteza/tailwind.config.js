/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}', './src/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        marca: '#6b1d3d',
        'marca-clara': '#8b2d4f',
        'marca-oscura': '#3a0c20',
        oro: '#d4af77',
        crema: '#faf6f2',
        texto: '#222222',
        linea: '#eee6dc',
        whatsapp: '#25d366',
        'whatsapp-oscuro': '#1ebc57',
      },
    },
  },
  plugins: [],
};
