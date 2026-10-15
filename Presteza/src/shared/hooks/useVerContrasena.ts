import { useState } from 'react';

/**
 * Controla el ojito que muestra u oculta una contraseña.
 *
 * Recibe el `secureTextEntry` del campo: si es falso, `esContrasena` queda en
 * falso y el campo se dibuja como siempre, sin botón.
 */
export function useVerContrasena(secureTextEntry?: boolean) {
  const esContrasena = Boolean(secureTextEntry);
  const [visible, setVisible] = useState(false);

  return {
    esContrasena,
    /** Lo que recibe el `TextInput`: se tapa salvo que el usuario pida verla. */
    oculto: esContrasena && !visible,
    icono: visible ? ('eye-outline' as const) : ('eye-off-outline' as const),
    etiqueta: visible ? 'Ocultar contraseña' : 'Mostrar contraseña',
    alternar: () => setVisible((actual) => !actual),
  };
}
