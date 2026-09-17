/** Parseo de respuestas del backend (listas, ids, objetos anidados). */

export function lista<T>(data: unknown, ...claves: string[]): T[] {
  if (Array.isArray(data)) return data as T[];
  if (!data || typeof data !== 'object') return [];

  const obj = data as Record<string, unknown>;
  for (const clave of claves) {
    const valor = obj[clave];
    if (Array.isArray(valor)) return valor as T[];
  }

  const anidado = Object.values(obj).find((valor) => Array.isArray(valor));
  if (anidado) return anidado as T[];

  const llaves = Object.keys(obj);
  if (llaves.length && llaves.every((clave) => /^\d+$/.test(clave))) {
    return llaves.sort((a, b) => Number(a) - Number(b)).map((clave) => obj[clave]) as T[];
  }

  return [];
}

export function texto(valor: unknown) {
  if (typeof valor === 'string') return valor;
  if (typeof valor === 'number' && Number.isFinite(valor)) return String(valor);
  if (valor && typeof valor === 'object' && 'toString' in valor) {
    const id = String(valor);
    if (id && id !== '[object Object]') return id;
  }
  return '';
}

export function entidad(data: unknown, ...claves: string[]): Record<string, unknown> {
  if (!data || typeof data !== 'object') return {};
  const obj = data as Record<string, unknown>;
  for (const clave of claves) {
    const valor = obj[clave];
    if (valor && typeof valor === 'object' && !Array.isArray(valor)) {
      return valor as Record<string, unknown>;
    }
  }
  return obj;
}

export async function seguro<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

export function idDe(item?: { _id?: string; id?: string } | null) {
  return item?._id || item?.id || '';
}
