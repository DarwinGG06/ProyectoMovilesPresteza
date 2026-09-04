/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}', './src/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        marca: '#6b1d3d',
        texto: '#222222',
        linea: '#eeeeee',
        whatsapp: '#25d366',
        'whatsapp-oscuro': '#1ebc57',
      },
    },
  },
  plugins: [],
};
