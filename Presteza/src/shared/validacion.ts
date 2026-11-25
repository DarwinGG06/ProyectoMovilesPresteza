/** Reglas compartidas de formularios (Colombia). */

export const TELEFONO_REGEX = /^[0-9]{10}$/;

export const reglasTelefono = {
  required: 'El teléfono es obligatorio',
  pattern: { value: TELEFONO_REGEX, message: 'Usa exactamente 10 dígitos' },
  maxLength: { value: 10, message: 'Máximo 10 dígitos' },
} as const;
