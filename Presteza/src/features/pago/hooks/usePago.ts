import { router } from 'expo-router';
import { useEffect, useState } from 'react';

import { entidad, idDe } from '@/api/helpers';
import { cotizarPuntos, crearPedidoConPuntos } from '@/api/loyalty';
import { agregarDireccion, actualizarDireccion, obtenerUsuario } from '@/api/perfil';
import { listarMesas } from '@/api/reservas';
import type { CotizacionPuntos, Direccion } from '@/features/perfil/types';
import { MESAS_SALON } from '@/features/reservas/data';
import { useCart } from '@/services/cart/CartContext';
import { useSession } from '@/session/context';
import { esAdmin } from '@/session/roles';
import { useAviso } from '@/shared/components/aviso';

const METODOS = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'card', label: 'Tarjeta' },
  { value: 'transfer', label: 'Transferencia' },
] as const;

const CANJE_MINIMO = 50;
const CIUDAD = 'Manizales';

export type DireccionPago = {
  name: string;
  address: string;
  neighborhood: string;
};

function vacia(): DireccionPago {
  return { name: '', address: '', neighborhood: '' };
}

function desdeGuardada(dir: Direccion): DireccionPago {
  return {
    name: dir.name || 'Casa',
    address: dir.address || '',
    neighborhood: dir.neighborhood || '',
  };
}

function textoDireccion(dir: DireccionPago) {
  const partes = [dir.address, dir.neighborhood, CIUDAD]
    .map((parte) => parte.trim())
    .filter(Boolean);
  if (!partes.length) return '';
  return dir.name.trim() ? `${dir.name.trim()} · ${partes.join(', ')}` : partes.join(', ');
}

export function usePago() {
  const aviso = useAviso();
  const { items, totalPrice, clearCart } = useCart();
  const { user, token, isAuthenticated } = useSession();
  const [metodo, setMetodo] = useState<(typeof METODOS)[number]['value']>('cash');
  const [tipo, setTipo] = useState<'mesa' | 'domicilio'>('mesa');
  const [mesa, setMesa] = useState<string | null>(null);
  const [mesas, setMesas] = useState<string[]>(MESAS_SALON.map((item) => item.id));
  const [guardadas, setGuardadas] = useState<Direccion[]>([]);
  const [indice, setIndice] = useState<number | null>(null);
  const [formulario, setFormulario] = useState<DireccionPago>(vacia);
  const [canjear, setCanjear] = useState(false);
  const [cotizacion, setCotizacion] = useState<CotizacionPuntos | null>(null);
  const [cotizando, setCotizando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);
  const [loginAbierto, setLoginAbierto] = useState(false);

  useEffect(() => {
    if (esAdmin(user)) {
      router.replace('/home/admin');
    }
  }, [user]);

  const userId = user?.id;
  useEffect(() => {
    let active = true;
    const recotar = async () => {
      await Promise.resolve();
      if (!active) return;
      if (!userId || totalPrice <= 0) {
        setCotizacion(null);
        setCotizando(false);
        return;
      }

      setCotizando(true);
      setError(null);
      try {
        const aplicarCumple = !canjear;
        const base = await cotizarPuntos(userId, totalPrice, 0, aplicarCumple);
        if (!active) return;
        const minimo = CANJE_MINIMO;
        const puedeCanjear = canjear && base.maxRedeemable >= minimo;

        if (puedeCanjear) {
          const quote = await cotizarPuntos(userId, totalPrice, base.maxRedeemable, false);
          if (active) setCotizacion(quote);
          return;
        }

        if (canjear && base.maxRedeemable < minimo) {
          setCanjear(false);
        }
        setCotizacion(base);
      } catch (err) {
        if (!active) return;
        setCanjear(false);
        setError(err instanceof Error ? err.message : 'No se pudo cotizar el descuento.');
      } finally {
        if (active) setCotizando(false);
      }
    };
    void recotar();
    return () => {
      active = false;
    };
  }, [canjear, totalPrice, userId]);

  useEffect(() => {
    void listarMesas()
      .then((lista) => {
        const numeros = lista
          .filter((item) => item.active !== false)
          .map((item) => item.number)
          .filter(Boolean);
        if (numeros.length) setMesas(numeros);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    let active = true;
    const request = userId ? obtenerUsuario(userId) : Promise.resolve({ addresses: [] });
    void request
      .then((perfil) => {
        if (!active) return;
        const lista = perfil.addresses ?? [];
        setGuardadas(lista);
        const principal = lista.findIndex((item) => item.is_primary);
        const elegido = principal >= 0 ? principal : lista.length ? 0 : null;
        setIndice(elegido);
        setFormulario(elegido === null ? vacia() : desdeGuardada(lista[elegido]));
      })
      .catch(() => {
        if (!active) return;
        setGuardadas([]);
        setIndice(null);
        setFormulario(vacia());
      });
    return () => {
      active = false;
    };
  }, [userId, isAuthenticated]);

  const elegirGuardada = (i: number) => {
    const dir = guardadas[i];
    if (!dir) return;
    setIndice(i);
    setFormulario(desdeGuardada(dir));
  };

  const nuevaDireccion = () => {
    setIndice(null);
    setFormulario(vacia());
  };

  const cambiarCampo = (campo: keyof DireccionPago, valor: string) => {
    setFormulario((prev) => ({ ...prev, [campo]: valor }));
  };

  const confirmar = async () => {
    if (esAdmin(user)) {
      setError('La casa no hace pedidos de cliente.');
      return;
    }
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
    if (tipo === 'mesa' && !mesa) {
      setError('Elige la mesa.');
      return;
    }
    const entrega = textoDireccion(formulario);
    if (tipo === 'domicilio') {
      if (!formulario.address.trim() || !formulario.neighborhood.trim()) {
        setError('Escribe la dirección y el barrio.');
        return;
      }
    }

    setEnviando(true);
    setError(null);
    setExito(null);
    try {
      if (tipo === 'domicilio') {
        const cuerpo: Direccion = {
          name: formulario.name.trim() || 'Casa',
          address: formulario.address.trim(),
          neighborhood: formulario.neighborhood.trim(),
          city: CIUDAD,
          postal_code: '170001',
          is_primary: true,
        };
        try {
          if (indice === null) await agregarDireccion(user.id, cuerpo);
          else await actualizarDireccion(user.id, indice, cuerpo);
        } catch {
          // El pedido igual sale con la dirección escrita aquí.
        }
      }

      const puntos = canjear ? (cotizacion?.pointsRedeemed ?? 0) : 0;
      const creado = await crearPedidoConPuntos(token, {
        payment_method: metodo,
        tipo,
        tableNumber: tipo === 'mesa' ? (mesa ?? undefined) : undefined,
        deliveryAddress: tipo === 'domicilio' ? entrega : undefined,
        pointsToRedeem: puntos,
        products: items.map((item) => ({
          dishId: item.dishId || item.id,
          quantity: item.quantity,
          adds: (item.selectedOptions ?? [])
            .filter((opcion) => opcion.id)
            .map((opcion) => ({ addId: opcion.id as string })),
        })),
      });
      const pedido = entidad(creado, 'order', 'pedido');
      const id = idDe(pedido);
      clearCart();
      router.replace(id ? `/seguimiento?id=${id}` : '/seguimiento');
      aviso.ok(
        'Pedido creado',
        'Recibimos tu pedido y vaciamos tu bandeja. Puedes consultar su estado en esta pantalla de seguimiento.'
      );
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
    tipo,
    setTipo,
    mesa,
    setMesa,
    mesas,
    guardadas,
    indice,
    elegirGuardada,
    nuevaDireccion,
    formulario,
    cambiarCampo,
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
