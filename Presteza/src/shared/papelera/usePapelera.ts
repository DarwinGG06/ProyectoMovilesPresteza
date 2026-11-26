import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  listarPapelera,
  restaurarPapelera,
  vaciarPapelera,
  type ItemPapelera,
  type PapeleraKind,
} from '@/api/papelera';
import { useSession } from '@/session/context';
import { useAviso } from '@/shared/components/aviso';

export type FiltroPapelera = 'todos' | PapeleraKind;

export function usePapelera(alcance: 'admin' | 'cliente') {
  const { token } = useSession();
  const aviso = useAviso();
  const [items, setItems] = useState<ItemPapelera[]>([]);
  const [cargando, setCargando] = useState(true);
  const [ocupado, setOcupado] = useState(false);
  const [filtro, setFiltro] = useState<FiltroPapelera>('todos');
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    if (!token) {
      setItems([]);
      setCargando(false);
      return;
    }
    setError(null);
    setCargando(true);
    try {
      setItems(await listarPapelera(token));
    } catch (err) {
      setItems([]);
      setError(err instanceof Error ? err.message : 'No se pudo abrir la papelera.');
    } finally {
      setCargando(false);
    }
  }, [token]);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  const lista = useMemo(() => {
    if (filtro === 'todos') return items;
    return items.filter((item) => item.kind === filtro);
  }, [filtro, items]);

  const restaurar = useCallback(
    (item: ItemPapelera) => {
      if (!token) return;
      aviso.confirmar({
        sello: 'PAPELERA',
        titulo: 'Restaurar',
        texto: `¿Devolver “${item.title}” a su sitio?`,
        confirmar: 'RESTAURAR',
        exito: {
          titulo: 'Restaurado',
          texto: `${item.title} volvió a su lista.`,
        },
        onConfirmar: async () => {
          setOcupado(true);
          try {
            await restaurarPapelera(token, item.kind, item.id);
            setItems((prev) => prev.filter((p) => !(p.kind === item.kind && p.id === item.id)));
          } finally {
            setOcupado(false);
          }
        },
      });
    },
    [aviso, token],
  );

  const vaciar = useCallback(
    (item: ItemPapelera) => {
      if (!token) return;
      aviso.confirmar({
        sello: 'PAPELERA',
        titulo: 'Borrar del todo',
        texto: `¿Eliminar “${item.title}” de forma definitiva? No se puede deshacer.`,
        confirmar: 'VACIAR',
        peligro: true,
        exito: {
          titulo: 'Eliminado',
          texto: `${item.title} ya no está en la papelera.`,
        },
        onConfirmar: async () => {
          setOcupado(true);
          try {
            await vaciarPapelera(token, item.kind, item.id);
            setItems((prev) => prev.filter((p) => !(p.kind === item.kind && p.id === item.id)));
          } finally {
            setOcupado(false);
          }
        },
      });
    },
    [aviso, token],
  );

  const filtros: { id: FiltroPapelera; etiqueta: string }[] =
    alcance === 'admin'
      ? [
          { id: 'todos', etiqueta: 'Todo' },
          { id: 'pedido', etiqueta: 'Pedidos' },
          { id: 'reserva', etiqueta: 'Reservas' },
          { id: 'mensaje', etiqueta: 'Mensajes' },
        ]
      : [
          { id: 'todos', etiqueta: 'Todo' },
          { id: 'pedido', etiqueta: 'Pedidos' },
          { id: 'reserva', etiqueta: 'Reservas' },
        ];

  return {
    lista,
    items,
    cargando,
    ocupado,
    error,
    filtro,
    setFiltro,
    filtros,
    recargar,
    restaurar,
    vaciar,
  };
}

export function etiquetaKind(kind: PapeleraKind) {
  if (kind === 'reserva') return 'RESERVA';
  if (kind === 'mensaje') return 'MENSAJE';
  return 'PEDIDO';
}

export function formatoFechaPapelera(valor?: string | null) {
  if (!valor) return '';
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return '';
  return fecha.toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
