const DIA = 24 * 60 * 60 * 1000;
const HORA = 60 * 60 * 1000;

export type PerfilCumpleanios = {
  id: string;
  birthDate?: string | null;
  birthdayBenefitYear?: number | null;
  birthdayEligible?: boolean;
};

export function fechaCivilBogota(ahora: Date) {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(ahora);
  const valor = (tipo: string) => Number(partes.find((p) => p.type === tipo)?.value);
  return new Date(Date.UTC(valor('year'), valor('month') - 1, valor('day')));
}

/** Fechas reales: incluye años bisiestos y ventanas entre diciembre y enero. */
export function planCumpleanios(perfil: PerfilCumpleanios, ahora = new Date()) {
  const iso = perfil.birthDate?.slice(0, 10);
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [nacimiento, mes, dia] = iso.split('-').map(Number);
  const valida = new Date(Date.UTC(nacimiento, mes - 1, dia));
  if (valida.toISOString().slice(0, 10) !== iso) return null;
  const anio = fechaCivilBogota(ahora).getUTCFullYear();

  for (const candidato of [anio - 1, anio, anio + 1]) {
    // Conserva la regla del backend: 29/02 se observa el 01/03 en años no bisiestos.
    const cumple = Date.UTC(candidato, mes - 1, dia);
    // Bogotá es UTC-5. Fin exclusivo: medianoche después del tercer día.
    const inicio = cumple - 3 * DIA + 5 * HORA;
    const fin = cumple + 4 * DIA + 5 * HORA;
    if (fin <= ahora.getTime()) continue;
    const enVentana = ahora.getTime() >= inicio;
    if (enVentana && perfil.birthdayEligible !== true) continue;

    let fechaAviso = Math.max(inicio + 9 * HORA, ahora.getTime() + 10_000);
    const anioAviso = fechaCivilBogota(new Date(fechaAviso)).getUTCFullYear();
    if (perfil.birthdayBenefitYear === anioAviso) {
      // El backend limita el uso por año calendario; no cambia esa regla.
      fechaAviso = Date.UTC(anioAviso + 1, 0, 1, 14);
    }
    if (fechaAviso >= fin) continue;
    return {
      periodo: new Date(cumple).toISOString().slice(0, 10),
      fechaAviso: new Date(fechaAviso),
      fin,
    };
  }
  return null;
}
