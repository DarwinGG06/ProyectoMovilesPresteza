import { router } from 'expo-router';
import { useEffect, useState } from 'react';

import { setToken as fijarToken } from '@/api/client';
import { entidad, idDe } from '@/api/helpers';
import { cotizarPuntos, crearPedidoConPuntos } from '@/api/loyalty';
import {
  agregarDireccion,
  actualizarDireccion,
  agregarTarjeta,
  obtenerTarjetas,
  obtenerUsuario,
} from '@/api/perfil';
import { listarMesas } from '@/api/reservas';
import type { CotizacionPuntos, Direccion, TarjetaForm, TarjetaPago } from '@/features/perfil/types';
import { MESAS_SALON } from '@/features/reservas/data';
import { useCart } from '@/services/cart/CartContext';
import { useSession } from '@/session/context';
import { esAdmin } from '@/session/roles';
import { useAviso } from '@/shared/components/aviso';
import type { PuntoMapa } from '@/shared/components/mapa/htmlMapaRuta';
import { avisarCambioCumpleanios } from '@/shared/notificaciones/cumpleanios';
import { leerUbicacionCliente } from '@/shared/ubicacion/ubicacionCliente';

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

export type ErroresDireccionPago = Partial<Record<keyof DireccionPago, string>>;

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
  const [erroresDireccion, setErroresDireccion] = useState<ErroresDireccionPago>({});
  const [puntoEntrega, setPuntoEntrega] = useState<PuntoMapa | null>(null);
  const [pidiendoUbicacion, setPidiendoUbicacion] = useState(false);
  const [errorUbicacion, setErrorUbicacion] = useState<string | null>(null);
  const [tarjetas, setTarjetas] = useState<TarjetaPago[]>([]);
  const [indiceTarjeta, setIndiceTarjeta] = useState<number | null>(null);
  const [formularioTarjeta, setFormularioTarjeta] = useState(false);
  const [guardandoTarjeta, setGuardandoTarjeta] = useState(false);
  const [errorTarjeta, setErrorTarjeta] = useState<string | null>(null);
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
        setErroresDireccion({});
      })
      .catch(() => {
        if (!active) return;
        setGuardadas([]);
        setIndice(null);
        setFormulario(vacia());
        setErroresDireccion({});
      });
    return () => {
      active = false;
    };
  }, [userId, isAuthenticated]);

  useEffect(() => {
    let active = true;
    if (!userId || !token) {
      setTarjetas([]);
      setIndiceTarjeta(null);
      return;
    }
    void obtenerTarjetas(userId, token)
      .then((lista) => {
        if (!active) return;
        setTarjetas(lista);
        const principal = lista.findIndex((item) => item.is_primary);
        setIndiceTarjeta(principal >= 0 ? principal : lista.length ? 0 : null);
      })
      .catch(() => {
        if (!active) return;
        setTarjetas([]);
        setIndiceTarjeta(null);
      });
    return () => {
      active = false;
    };
  }, [token, userId, isAuthenticated]);

  const elegirGuardada = (i: number) => {
    const dir = guardadas[i];
    if (!dir) return;
    setIndice(i);
    setFormulario(desdeGuardada(dir));
    setErroresDireccion({});
  };

  const nuevaDireccion = () => {
    setIndice(null);
    setFormulario(vacia());
    setErroresDireccion({});
  };

  const cambiarCampo = (campo: keyof DireccionPago, valor: string) => {
    setFormulario((prev) => ({ ...prev, [campo]: valor }));
    setErroresDireccion((prev) => {
      if (!prev[campo]) return prev;
      const siguiente = { ...prev };
      delete siguiente[campo];
      return siguiente;
    });
  };

  const setMetodoPago = (valor: (typeof METODOS)[number]['value']) => {
    setMetodo(valor);
    setErrorTarjeta(null);
    setFormularioTarjeta(false);
  };

  const pedirUbicacion = async () => {
    setPidiendoUbicacion(true);
    setErrorUbicacion(null);
    try {
      const punto = await leerUbicacionCliente();
      setPuntoEntrega(punto);
    } catch (err) {
      setPuntoEntrega(null);
      setErrorUbicacion(
        err instanceof Error ? err.message : 'No se pudo leer tu ubicación.',
      );
    } finally {
      setPidiendoUbicacion(false);
    }
  };

  const elegirTipo = (siguiente: 'mesa' | 'domicilio') => {
    setTipo(siguiente);
    setError(null);
    if (siguiente === 'mesa') {
      setPuntoEntrega(null);
      setErrorUbicacion(null);
      setPidiendoUbicacion(false);
      return;
    }
    void pedirUbicacion();
  };

  const guardarTarjeta = async (datos: TarjetaForm) => {
    if (!userId || !token) {
      setLoginAbierto(true);
      return;
    }
    setGuardandoTarjeta(true);
    setErrorTarjeta(null);
    try {
      const cuerpo: TarjetaPago = {
        name: datos.name.trim(),
        cardholder_name: datos.cardholder_name.trim(),
        last_four_digits: datos.last_four_digits,
        type: datos.type,
        brand: datos.brand,
        expiry_date: datos.expiry_date,
        is_primary: datos.is_primary,
      };
      const actualizado = await agregarTarjeta(userId, token, cuerpo);
      const lista = actualizado.paymentCards ?? [];
      setTarjetas(lista);
      setIndiceTarjeta(lista.length ? lista.length - 1 : null);
      setFormularioTarjeta(false);
      aviso.ok('Tarjeta creada', `${cuerpo.name} quedó lista para pagar.`);
    } catch (err) {
      setErrorTarjeta(err instanceof Error ? err.message : 'No se pudo guardar la tarjeta.');
    } finally {
      setGuardandoTarjeta(false);
    }
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
    let puntoGps: PuntoMapa | null = puntoEntrega;
    if (tipo === 'domicilio') {
      const errores: ErroresDireccionPago = {};
      if (!formulario.address.trim()) errores.address = 'Escribe la dirección';
      if (!formulario.neighborhood.trim()) errores.neighborhood = 'Escribe el barrio';
      if (Object.keys(errores).length) {
        setErroresDireccion(errores);
        setError(null);
        return;
      }
      if (!puntoGps) {
        setPidiendoUbicacion(true);
        setErrorUbicacion(null);
        try {
          puntoGps = await leerUbicacionCliente();
          setPuntoEntrega(puntoGps);
        } catch (err) {
          setPuntoEntrega(null);
          const mensaje =
            err instanceof Error
              ? err.message
              : 'Activa la ubicación para el domicilio.';
          setErrorUbicacion(mensaje);
          setError(mensaje);
          setPidiendoUbicacion(false);
          return;
        } finally {
          setPidiendoUbicacion(false);
        }
      }
    }
    if (metodo === 'card') {
      if (indiceTarjeta === null || !tarjetas[indiceTarjeta]) {
        setErrorTarjeta('Elige o agrega una tarjeta para pagar.');
        setError(null);
        return;
      }
    }

    setEnviando(true);
    setError(null);
    setErrorTarjeta(null);
    setErroresDireccion({});
    setExito(null);
    try {
      if (tipo === 'domicilio') {
    fijarToken(token);
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
        deliveryLat: tipo === 'domicilio' ? (puntoGps?.lat ?? undefined) : undefined,
        deliveryLng: tipo === 'domicilio' ? (puntoGps?.lng ?? undefined) : undefined,
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
      avisarCambioCumpleanios();
      const id = idDe(pedido);
      clearCart();
      router.replace(id ? `/seguimiento?id=${id}` : '/seguimiento');
      aviso.ok(
        'Pedido creado',
        'Recibimos tu pedido y vaciamos tu bandeja. Puedes consultar su estado en esta pantalla de seguimiento.'
      );
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'No se pudo crear el pedido.';
      if (/no autorizado/i.test(mensaje)) {
        setError('Tu sesión venció. Entra de nuevo y confirma el pedido.');
        setLoginAbierto(true);
      } else {
        setError(mensaje);
      }
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
    setMetodo: setMetodoPago,
    metodos: METODOS,
    tipo,
    setTipo: elegirTipo,
    mesa,
    setMesa,
    mesas,
    guardadas,
    indice,
    elegirGuardada,
    nuevaDireccion,
    formulario,
    erroresDireccion,
    cambiarCampo,
    puntoEntrega,
    pidiendoUbicacion,
    errorUbicacion,
    pedirUbicacion,
    tarjetas,
    indiceTarjeta,
    setIndiceTarjeta: (i: number) => {
      setIndiceTarjeta(i);
      setErrorTarjeta(null);
    },
    formularioTarjeta,
    abrirFormularioTarjeta: () => {
      setFormularioTarjeta(true);
      setErrorTarjeta(null);
    },
    cancelarFormularioTarjeta: () => setFormularioTarjeta(false),
    guardarTarjeta,
    guardandoTarjeta,
    errorTarjeta,
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
