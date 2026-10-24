import type {
  CotizacionPuntos,
  HistorialPuntos,
  NivelFidelidad,
  ProgramaFidelidad,
} from '@/features/perfil/types';

import { request } from './client';
import { entidad, lista, texto } from './helpers';

const CANJE_MINIMO = 50;

function numero(valor: unknown, fallback = 0) {
  const n = Number(valor);
  return Number.isFinite(n) ? n : fallback;
}

function nivelDe(crudo: unknown): NivelFidelidad {
  const dato = crudo && typeof crudo === 'object' ? (crudo as Record<string, unknown>) : {};
  return {
    id: texto(dato.id) || 'bronce',
    name: texto(dato.name) || 'Bronce',
    multiplier: numero(dato.multiplier, 1),
    discountPercent: numero(dato.discountPercent),
    benefits: Array.isArray(dato.benefits) ? dato.benefits.map((item) => String(item)) : [],
  };
}

function historialDe(crudo: unknown): HistorialPuntos {
  const dato = crudo && typeof crudo === 'object' ? (crudo as Record<string, unknown>) : {};
  const tipo = texto(dato.type);
  return {
    id: texto(dato.id),
    type: tipo === 'redeem' || tipo === 'refund' ? tipo : 'earn',
    points: numero(dato.points),
    orderId: texto(dato.orderId) || null,
    description: texto(dato.description) || null,
    discountCop: numero(dato.discountCop),
    createdAt: texto(dato.createdAt) || undefined,
  };
}

export function normalizarPrograma(crudo: unknown): ProgramaFidelidad {
  const raiz = entidad(crudo, 'loyalty');
  const fuente = Object.keys(raiz).length
    ? raiz
    : crudo && typeof crudo === 'object'
      ? (crudo as Record<string, unknown>)
      : {};
  const reglas =
    fuente.rules && typeof fuente.rules === 'object'
      ? (fuente.rules as Record<string, unknown>)
      : {};
  const siguiente =
    fuente.nextTier && typeof fuente.nextTier === 'object'
      ? (fuente.nextTier as Record<string, unknown>)
      : null;

  return {
    userId: texto(fuente.userId),
    points: numero(fuente.points),
    pointsEarned: numero(fuente.pointsEarned),
    pointsRedeemed: numero(fuente.pointsRedeemed),
    completedOrders: numero(fuente.completedOrders),
    tier: nivelDe(fuente.tier),
    nextTier: siguiente
      ? {
          id: texto(siguiente.id),
          name: texto(siguiente.name),
          pointsNeeded: numero(siguiente.pointsNeeded),
          ordersNeeded: numero(siguiente.ordersNeeded),
        }
      : null,
    rules: {
      pointCopUnit: numero(reglas.pointCopUnit, 1000),
      pointValueCop: numero(reglas.pointValueCop, 100),
      minRedeemPoints: numero(reglas.minRedeemPoints, CANJE_MINIMO),
      maxRedeemPercent: numero(reglas.maxRedeemPercent, 50),
    },
    history: lista(fuente, 'history').map(historialDe),
  };
}

export function normalizarCotizacion(crudo: unknown): CotizacionPuntos {
  const dato = entidad(crudo, 'quote');
  const fuente = Object.keys(dato).length
    ? dato
    : crudo && typeof crudo === 'object'
      ? (crudo as Record<string, unknown>)
      : {};
  return {
    subtotal: numero(fuente.subtotal),
    tier: nivelDe(fuente.tier),
    tierDiscount: numero(fuente.tierDiscount),
    pointsRedeemed: numero(fuente.pointsRedeemed),
    pointsDiscount: numero(fuente.pointsDiscount),
    discount: numero(fuente.discount),
    total: numero(fuente.total),
    estimatedPoints: numero(fuente.estimatedPoints),
    maxRedeemable: numero(fuente.maxRedeemable),
    birthdayDiscount: numero(fuente.birthdayDiscount),
    birthdayApplied: Boolean(fuente.birthdayApplied),
    birthdayEligible: Boolean(fuente.birthdayEligible),
  };
}

export async function obtenerPrograma(userId: string, jwt?: string) {
  const data = await request(`/loyalty/${userId}`, { token: jwt });
  return normalizarPrograma(data);
}

export async function cotizarPuntos(
  userId: string,
  total: number,
  pointsToRedeem = 0,
  aplicarCumpleanos = true,
) {
  const data = await request(
    `/loyalty/${userId}/quote?total=${Math.max(0, Math.round(total))}&pointsToRedeem=${Math.max(0, Math.floor(pointsToRedeem))}&applyBirthday=${aplicarCumpleanos ? '1' : '0'}`,
  );
  return normalizarCotizacion(data);
}

export async function crearPedidoConPuntos(
  jwt: string,
  datos: {
    payment_method: string;
    products: {
      dishId: string;
      quantity: number;
      adds?: { addId: string }[];
    }[];
    pointsToRedeem?: number;
  },
) {
  return request(`/orders`, {
    method: 'POST',
    token: jwt,
    body: datos,
  });
}
