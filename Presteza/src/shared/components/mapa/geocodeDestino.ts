import type { PuntoMapa } from './htmlMapaRuta';

/** Centroides OSM Manizales (Versalles real, no Belén). */
const BARRIOS: Record<string, PuntoMapa> = {
  'cerros de versalles': { lat: 5.063147, lng: -75.49881 },
  versalles: { lat: 5.063147, lng: -75.49881 },
  'la argentina': { lat: 5.0665586, lng: -75.4959043 },
  milan: { lat: 5.050441, lng: -75.48353 },
  milán: { lat: 5.050441, lng: -75.48353 },
  palermo: { lat: 5.0589, lng: -75.4842 },
  'el cable': { lat: 5.0682, lng: -75.5174 },
  cable: { lat: 5.0682, lng: -75.5174 },
  centro: { lat: 5.0689, lng: -75.5174 },
};

function sinAlias(texto: string) {
  return texto.includes('·') ? texto.split('·').slice(1).join('·').trim() : texto.trim();
}

function detectarBarrio(texto: string) {
  const limpio = sinAlias(texto).toLowerCase();
  return (
    Object.keys(BARRIOS)
      .sort((a, b) => b.length - a.length)
      .find((n) => limpio.includes(n)) ?? null
  );
}

function consultas(texto: string): string[] {
  const limpio = sinAlias(texto);
  if (!limpio) return [];
  const barrio = detectarBarrio(texto);
  const calle = limpio
    .split(',')[0]
    ?.replace(/#\s*[\w.-]+/g, '')
    .replace(/\b\d+[A-Za-z]?\s*[-–]\s*\d+[A-Za-z]?\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const ciudad = (q: string) => {
    let out = q;
    for (const e of ['Manizales', 'Caldas', 'Colombia']) {
      if (!out.toLowerCase().includes(e.toLowerCase())) out += `, ${e}`;
    }
    return out;
  };
  return [
    ...new Set(
      [
        calle && barrio ? ciudad(`${calle}, ${barrio}`) : '',
        barrio ? ciudad(barrio) : '',
        calle ? ciudad(calle) : '',
      ].filter(Boolean),
    ),
  ];
}

async function nominatim(consulta: string): Promise<PuntoMapa | null> {
  const url =
    'https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=co&q=' +
    encodeURIComponent(consulta);
  const res = await fetch(url, { headers: { Accept: 'application/json' } }).catch(() => null);
  if (!res?.ok) return null;
  const data = (await res.json()) as { lat?: string; lon?: string; display_name?: string }[];
  const hit = data[0];
  if (!hit) return null;
  if (consulta.toLowerCase().includes('versalles') && !(hit.display_name || '').toLowerCase().includes('versalles')) {
    return null;
  }
  const lat = Number(hit.lat);
  const lng = Number(hit.lon);
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

/** Calle+barrio online; si falla, centroide del barrio. */
export async function geocodeDestino(texto?: string | null): Promise<PuntoMapa | null> {
  if (!texto?.trim()) return null;
  for (const consulta of consultas(texto)) {
    try {
      const punto = await Promise.race([
        nominatim(consulta),
        new Promise<null>((ok) => setTimeout(() => ok(null), 3500)),
      ]);
      if (punto) return punto;
    } catch {
      // siguiente
    }
  }
  const barrio = detectarBarrio(texto);
  return barrio ? BARRIOS[barrio] : null;
}
