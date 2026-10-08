import { useEffect, useMemo, useState } from 'react';

import type { MensajeAdmin, MensajeForm } from '../types';
import { idDe } from '../utils';

export function useTabMensajes(
  mensajes: MensajeAdmin[],
  onGuardar: (datos: MensajeForm, editando?: MensajeAdmin | null) => Promise<boolean>,
) {
  const [vista, setVista] = useState<'lista' | 'cuadricula'>('lista');
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState<MensajeAdmin | null>(null);
  const [detalle, setDetalle] = useState<MensajeAdmin | null>(null);

  const lista = useMemo(
    () =>
      [...mensajes].sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()),
    [mensajes],
  );

  // Si el mensaje que se está viendo desaparece de la lista (p. ej. se eliminó), se cierra el detalle.
  useEffect(() => {
    if (detalle && !mensajes.some((item) => idDe(item) === idDe(detalle))) setDetalle(null);
  }, [detalle, mensajes]);

  const abrir = (mensaje?: MensajeAdmin) => {
    setEditando(mensaje ?? null);
    setAbierto(true);
  };

  const cerrar = () => setAbierto(false);

  const verDetalle = (mensaje: MensajeAdmin) => setDetalle(mensaje);

  const cerrarDetalle = () => setDetalle(null);

  const editarDesdeDetalle = () => {
    if (!detalle) return;
    const mensaje = detalle;
    setDetalle(null);
    abrir(mensaje);
  };

  const guardar = async (datos: MensajeForm) => {
    if (await onGuardar(datos, editando)) setAbierto(false);
  };

  return {
    vista,
    setVista,
    abierto,
    editando,
    detalle,
    lista,
    abrir,
    cerrar,
    verDetalle,
    cerrarDetalle,
    editarDesdeDetalle,
    guardar,
    valoresFormulario: {
      name: editando?.name ?? '',
      email: editando?.email ?? '',
      phone: editando?.phone ?? '',
      subject: editando?.subject ?? '',
      message: editando?.message ?? '',
    } satisfies MensajeForm,
  };
}
