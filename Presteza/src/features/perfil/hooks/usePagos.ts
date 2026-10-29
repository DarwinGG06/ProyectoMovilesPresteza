import { useCallback, useState } from 'react';

import {
  actualizarTarjeta,
  agregarTarjeta,
  eliminarTarjeta,
  marcarTarjetaPrincipal,
} from '@/api/perfil';
import { useAviso } from '@/shared/components/aviso';

import type { TarjetaForm, TarjetaPago, UsuarioPerfil } from '../types';
import { vencimientoAAAA } from '../utils';

type UsePagosParams = {
  userId: string;
  token: string;
  /** Tarjetas guardadas: de aquí salen los valores al editar. */
  tarjetas: TarjetaPago[];
  onActualizado: (perfil: UsuarioPerfil) => void;
};

export function usePagos({ userId, token, tarjetas, onActualizado }: UsePagosParams) {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [indiceEdicion, setIndiceEdicion] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const aviso = useAviso();

  // `useCallback`: la misma función en cada render. TabPagos la usa dentro de un
  // useEffect; si cambiara en cada render, el efecto volvería a abrir el
  // formulario justo después de CANCELAR.
  const abrirFormulario = useCallback(() => {
    setIndiceEdicion(null);
    setMostrarForm(true);
  }, []);

  const editar = (index: number) => {
    setError(null);
    setMostrarForm(false);
    setIndiceEdicion(index);
  };

  const cancelar = useCallback(() => {
    setMostrarForm(false);
    setIndiceEdicion(null);
    setError(null);
  }, []);

  const guardar = async (datos: TarjetaForm) => {
    setError(null);
    setGuardando(true);
    const cuerpo: TarjetaPago = {
      name: datos.name.trim(),
      cardholder_name: datos.cardholder_name.trim(),
      last_four_digits: datos.last_four_digits,
      type: datos.type,
      brand: datos.brand,
      expiry_date: datos.expiry_date,
      is_primary: datos.is_primary,
    };
    const editando = indiceEdicion !== null;

    try {
      const actualizado = editando
        ? await actualizarTarjeta(userId, token, indiceEdicion, cuerpo)
        : await agregarTarjeta(userId, token, cuerpo);
      onActualizado(actualizado);
      cancelar();
      aviso.ok(
        editando ? 'Tarjeta editada' : 'Tarjeta creada',
        editando ? `${cuerpo.name} fue editada.` : `${cuerpo.name} fue agregada.`,
      );
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

  const tarjeta = indiceEdicion === null ? undefined : tarjetas[indiceEdicion];
  const valores: TarjetaForm | undefined = tarjeta
    ? {
        name: tarjeta.name ?? '',
        cardholder_name: tarjeta.cardholder_name ?? '',
        last_four_digits: tarjeta.last_four_digits ?? '',
        type: tarjeta.type === 'debit' ? 'debit' : 'credit',
        brand: tarjeta.brand ?? 'Visa',
        expiry_date: vencimientoAAAA(tarjeta.expiry_date),
        is_primary: Boolean(tarjeta.is_primary),
      }
    : undefined;

  return {
    formularioAbierto: mostrarForm || indiceEdicion !== null,
    editando: indiceEdicion !== null,
    indiceEdicion,
    valores,
    abrirFormulario,
    editar,
    cancelar,
    guardar,
    guardando,
    error,
    marcarPrincipal,
    eliminar,
  };
}
