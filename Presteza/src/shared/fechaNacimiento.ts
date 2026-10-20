export const EDAD_MINIMA_REGISTRO = 15;

export function fechaHoyLocal() {
  const ahora = new Date();
  return new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
}

export function aIso(fecha: Date) {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function deIso(iso: string): Date | null {
  const match = String(iso || '')
    .trim()
    .match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const fecha = new Date(year, month - 1, day);
  if (
    fecha.getFullYear() !== year ||
    fecha.getMonth() !== month - 1 ||
    fecha.getDate() !== day
  ) {
    return null;
  }
  return fecha;
}

export function restarAnios(fecha: Date, anios: number) {
  return new Date(fecha.getFullYear() - anios, fecha.getMonth(), fecha.getDate());
}

export function fechaMaximaRegistro() {
  return restarAnios(fechaHoyLocal(), EDAD_MINIMA_REGISTRO);
}

export function fechaMinimaRegistro() {
  return new Date(1920, 0, 1);
}

export function edadEnAnios(iso: string) {
  const nacimiento = deIso(iso);
  if (!nacimiento) return null;
  const hoy = fechaHoyLocal();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  if (
    hoy.getMonth() < nacimiento.getMonth() ||
    (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate())
  ) {
    edad -= 1;
  }
  return edad;
}

export function mensajeEdadRegistro(iso: string) {
  if (!deIso(iso)) return 'Elige una fecha de nacimiento válida';
  const edad = edadEnAnios(iso);
  if (edad === null || edad < EDAD_MINIMA_REGISTRO) {
    return `Debes tener al menos ${EDAD_MINIMA_REGISTRO} años para registrarte`;
  }
  return null;
}

export function formatearFechaLarga(iso: string) {
  const fecha = deIso(iso);
  if (!fecha) return '';
  return fecha.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
