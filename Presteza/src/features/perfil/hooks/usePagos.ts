import { useState } from 'react';

import { agregarTarjeta, eliminarTarjeta, marcarTarjetaPrincipal } from '@/api/perfil';
import { useAviso } from '@/shared/components/aviso';

import type { TarjetaForm, UsuarioPerfil } from '../types';

type UsePagosParams = {
  userId: string;
  token: string;
  onActualizado: (perfil: UsuarioPerfil) => void;
};

export function usePagos({ userId, token, onActualizado }: UsePagosParams) {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const aviso = useAviso();

  const abrirFormulario = () => setMostrarForm(true);
  const cancelar = () => setMostrarForm(false);

  const guardar = async (datos: TarjetaForm) => {
    setError(null);
    setGuardando(true);
    try {
      const actualizado = await agregarTarjeta(userId, token, {
        name: datos.name.trim(),
        cardholder_name: datos.cardholder_name.trim(),
        last_four_digits: datos.last_four_digits,
        type: datos.type,
        brand: datos.brand,
        expiry_date: datos.expiry_date,
        is_primary: datos.is_primary,
      });
      onActualizado(actualizado);
      setMostrarForm(false);
      aviso.ok('Tarjeta creada', `${datos.name.trim()} fue agregada.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la tarjeta.');
    } finally {
      setGuardando(false);
    }
  };

  const marcarPrincipal = async (index: number) => {
    try {
      onActualizado(await marcarTarjetaPrincipal(userId, token, index));
      aviso.ok('Tarjeta principal', 'La tarjeta quedó como principal.');
    } catch (err) {
      aviso.errorDe(err, 'No se pudo marcar como principal.', 'Pago');
    }
  };

  const eliminar = (index: number, nombre: string) => {
    aviso.confirmar({
      sello: 'PAGOS',
      titulo: 'Eliminar tarjeta',
      texto: `¿Quieres eliminar ${nombre}?`,
      confirmar: 'ELIMINAR',
      peligro: true,
      exito: {
        titulo: 'Tarjeta eliminada',
        texto: `${nombre} fue eliminada.`,
      },
      onConfirmar: async () => {
        onActualizado(await eliminarTarjeta(userId, token, index));
      },
    });
  };

  return {
    formularioAbierto: mostrarForm,
    abrirFormulario,
    cancelar,
    guardar,
    guardando,
    error,
    marcarPrincipal,
    eliminar,
  };
}
