import { FontAwesome } from '@expo/vector-icons';
import { cssInterop } from 'nativewind';

cssInterop(FontAwesome, {
  className: {
    target: 'style',
    nativeStyleToProp: { color: true },
  },
});

export { FontAwesome as Icono };
