/** Reglas compartidas de formularios (Colombia). */

export const TELEFONO_REGEX = /^[0-9]{10}$/;

export const reglasTelefono = {
  required: 'El teléfono es obligatorio',
  pattern: { value: TELEFONO_REGEX, message: 'Usa exactamente 10 dígitos' },
  maxLength: { value: 10, message: 'Máximo 10 dígitos' },
} as const;

export const reglasPersonas = {
  required: 'Indica cuántas personas',
  pattern: { value: /^[1-9][0-9]?$/, message: 'Solo números' },
  validate: (valor: string) => {
    const n = Number(valor);
    if (!Number.isFinite(n) || n < 1) return 'Mínimo 1 persona';
    if (n > 20) return 'Máximo 20 personas';
    return true;
  },
} as const;

/** Misma fuerza que restablecer/perfil y @IsStrongPassword del back. */
export const CONTRASENA_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

export const reglasContrasena = {
  required: 'La contraseña es obligatoria',
  minLength: { value: 8, message: 'Mínimo 8 caracteres' },
  maxLength: { value: 72, message: 'Máximo 72 caracteres' },
  pattern: {
    value: CONTRASENA_REGEX,
    message: 'Usa mayúscula, minúscula y un número',
  },
} as const;

/** Checklist en vivo para el registro. */
export function requisitosContrasena(valor: string) {
  const v = valor ?? '';
  return [
    { ok: v.length >= 8, texto: 'Al menos 8 caracteres' },
    { ok: /[A-Z]/.test(v), texto: 'Una mayúscula' },
    { ok: /[a-z]/.test(v), texto: 'Una minúscula' },
    { ok: /\d/.test(v), texto: 'Un número' },
  ] as const;
}

/** Ruta a reservas con nombre y cupo prellenados. */
export function rutaReservaRapida(nombre: string, personas: string) {
  const cupo = Math.min(20, Math.max(1, Number(personas) || 2));
  const params = new URLSearchParams({
    nombre: nombre.trim(),
    personas: String(cupo),
  });
  return `/home/reservas?${params.toString()}` as const;
}
