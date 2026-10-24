import type { AdicionalAdmin } from '@/features/administracion/types';

type FamiliaCarta = 'postre' | 'hamburguesa' | 'mesa';

const POSTRE: AdicionalAdmin[] = [
  { id: 'bola-extra', name: 'Bola extra de helado', price: 4500 },
  { id: 'salsa-chocolate', name: 'Salsa de chocolate', price: 2500 },
  { id: 'crema-batida', name: 'Crema batida', price: 2000 },
  { id: 'frutos-rojos', name: 'Frutos rojos', price: 3000 },
];

const HAMBURGUESA: AdicionalAdmin[] = [
  { id: 'queso-extra', name: 'Queso extra', price: 3000 },
  { id: 'tocineta', name: 'Tocineta', price: 4000 },
  { id: 'huevo-frito', name: 'Huevo frito', price: 3500 },
];

const MESA: AdicionalAdmin[] = [
  { id: 'porcion-extra', name: 'Porción extra', price: 5000 },
  { id: 'salsa-casa', name: 'Salsa de la casa', price: 2000 },
];

export function familiaDeCarta(texto: string): FamiliaCarta {
  const clave = texto.toLowerCase();
  if (/postre|helado|dulce|torta|mousse|brownie|chocolate|crema batida|frutos rojos|bola extra/.test(clave)) {
    return 'postre';
  }
  if (/hamburg|burger|queso extra|tocineta|huevo frito/.test(clave)) {
    return 'hamburguesa';
  }
  return 'mesa';
}

export function extraParaPlato(
  extra: AdicionalAdmin,
  categoria: string,
  nombrePlato: string,
  categoryId?: string,
  platoId?: string,
): boolean {
  const platos = extra.dishIds ?? [];
  const cats = extra.categoryIds ?? [];
  if (platoId && platos.some((item) => String(item) === platoId)) return true;
  if (categoryId && cats.some((item) => String(item) === String(categoryId))) return true;
  if (platos.length || cats.length) return false;

  const familiaPlato = familiaDeCarta(`${categoria} ${nombrePlato}`);
  const familiaExtra = familiaDeCarta(`${extra.name} ${extra.description ?? ''}`);
  if (familiaPlato === 'postre') return familiaExtra === 'postre';
  if (familiaPlato === 'hamburguesa') return familiaExtra === 'hamburguesa' || familiaExtra === 'mesa';
  return familiaExtra === 'mesa';
}

/** Si el backend no trae extras para el plato, la carta ofrece estos. */
export function extrasSugeridos(categoria: string, nombrePlato: string): AdicionalAdmin[] {
  const familia = familiaDeCarta(`${categoria} ${nombrePlato}`);
  if (familia === 'postre') return POSTRE;
  if (familia === 'hamburguesa') return HAMBURGUESA;
  return MESA;
}
