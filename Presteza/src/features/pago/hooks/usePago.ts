import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { entidad, idDe } from '@/api/helpers';
import { cotizarPuntos, crearPedidoConPuntos } from '@/api/loyalty';
import type { CotizacionPuntos } from '@/features/perfil/types';
import { formatCOP, useCart } from '@/services/cart/CartContext';
import { useSession } from '@/session/context';

const METODOS = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'card', label: 'Tarjeta' },
  { value: 'transfer', label: 'Transferencia' },
] as const;

const CANJE_MINIMO = 50;

export function usePago() {
  const { items, totalPrice, clearCart } = useCart();
  const { user, token, isAuthenticated } = useSession();
  const [metodo, setMetodo] = useState<(typeof METODOS)[number]['value']>('cash');
  const [canjear, setCanjear] = useState(false);
  const [cotizacion, setCotizacion] = useState<CotizacionPuntos | null>(null);
  const [cotizando, setCotizando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);
  const [loginAbierto, setLoginAbierto] = useState(false);

  const recotar = useCallback(async () => {
    if (!user?.id || totalPrice <= 0) {
      setCotizacion(null);
      return;
    }

    setCotizando(true);
    setError(null);
    try {
      const aplicarCumple = !canjear;
      const base = await cotizarPuntos(user.id, totalPrice, 0, aplicarCumple);
      const minimo = CANJE_MINIMO;
      const puedeCanjear = canjear && base.maxRedeemable >= minimo;

      if (puedeCanjear) {
        setCotizacion(
          await cotizarPuntos(user.id, totalPrice, base.maxRedeemable, false),
        );
        return;
      }

      if (canjear && base.maxRedeemable < minimo) {
        setCanjear(false);
      }
      setCotizacion(base);
    } catch (err) {
      setCanjear(false);
      setError(err instanceof Error ? err.message : 'No se pudo cotizar el descuento.');
    } finally {
      setCotizando(false);
    }
  }, [canjear, totalPrice, user?.id]);

  useEffect(() => {
    void recotar();
  }, [recotar]);

  const confirmar = async () => {
    if (!isAuthenticated || !user) {
      setLoginAbierto(true);
      return;
    }
    if (!token) {
      setError('Inicia sesión para confirmar el pedido.');
      return;
    }
    if (items.length === 0) {
      setError('La bandeja está vacía.');
      return;
    }

    setEnviando(true);
    setError(null);
    setExito(null);
    try {
      const puntos = canjear ? (cotizacion?.pointsRedeemed ?? 0) : 0;
      const creado = await crearPedidoConPuntos(token, {
        usuarioId: user.id,
        user_name: user.name,
        payment_method: metodo,
        total: totalPrice,
        pointsToRedeem: puntos,
        products: items.map((item) => {
          const extras = item.selectedOptions?.map((opcion) => opcion.name).join(', ');
          return {
            dishId: item.dishId || item.id,
            name: item.productName,
            quantity: item.quantity,
            unit_price: item.totalPrice / item.quantity,
            description: extras ? `${item.productName} · ${extras}` : item.productName,
          };
        }),
      });
      const pedido = entidad(creado, 'order', 'pedido');
      const id = idDe(pedido);
      clearCart();
      router.replace(id ? `/seguimiento?id=${id}` : '/seguimiento');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el pedido.');
    } finally {
      setEnviando(false);
    }
  };

  const minimo = CANJE_MINIMO;
  const puedeCanjear = (cotizacion?.maxRedeemable ?? 0) >= minimo || canjear;
  const cumpleDisponible = Boolean(cotizacion?.birthdayEligible || cotizacion?.birthdayApplied);

  const elegirCanje = (usarPuntos: boolean) => {
    setCanjear(usarPuntos);
  };

  return {
    items,
    totalPrice,
    metodo,
    setMetodo,
    metodos: METODOS,
    canjear,
    setCanjear: elegirCanje,
    puedeCanjear,
    cumpleDisponible,
    cotizacion,
    cotizando,
    enviando,
    error,
    exito,
    isAuthenticated,
    loginAbierto,
    abrirLogin: () => setLoginAbierto(true),
    cerrarLogin: () => setLoginAbierto(false),
    confirmar,
    irAlMenu: () => router.push('/home/menu'),
  };
}
