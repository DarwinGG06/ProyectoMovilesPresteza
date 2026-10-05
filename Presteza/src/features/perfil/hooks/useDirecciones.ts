import { useState } from 'react';

import {
  actualizarDireccion,
  agregarDireccion,
  eliminarDireccion,
  marcarDireccionPrincipal,
} from '@/api/perfil';
import { useAviso } from '@/shared/components/aviso';

import type { Direccion, DireccionForm, UsuarioPerfil } from '../types';

type UseDireccionesParams = {
  userId: string;
  perfil: UsuarioPerfil;
  onActualizado: (perfil: UsuarioPerfil) => void;
};

export function useDirecciones({ userId, perfil, onActualizado }: UseDireccionesParams) {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [indiceEdicion, setIndiceEdicion] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const aviso = useAviso();

  const abrirFormulario = () => setMostrarForm(true);

  const editar = (index: number) => {
    setIndiceEdicion(index);
    setMostrarForm(false);
  };

  const cancelar = () => {
    setMostrarForm(false);
    setIndiceEdicion(null);
    setError(null);
  };

  const guardar = async (datos: DireccionForm) => {
    setError(null);
    setGuardando(true);
    const cuerpo: Direccion = {
      name: datos.name.trim(),
      address: datos.address.trim(),
      neighborhood: datos.neighborhood.trim(),
      city: 'Manizales',
      postal_code: '170001',
      is_primary: datos.is_primary,
    };

    try {
      const actualizado =
        indiceEdicion === null
          ? await agregarDireccion(userId, cuerpo)
          : await actualizarDireccion(userId, indiceEdicion, cuerpo);
      onActualizado(actualizado);
      cancelar();
      aviso.ok(
        indiceEdicion === null ? 'Dirección creada' : 'Dirección editada',
        indiceEdicion === null ? `${cuerpo.name} fue agregada.` : `${cuerpo.name} fue editada.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la dirección.');
    } finally {
      setGuardando(false);
    }
  };

  const marcarPrincipal = async (index: number) => {
    try {
      onActualizado(await marcarDireccionPrincipal(userId, index));
      aviso.ok('Dirección principal', 'La dirección quedó como principal.');
    } catch (err) {
      aviso.errorDe(err, 'No se pudo marcar como principal.', 'Dirección');
    }
  };

  const eliminar = (index: number, nombre: string) => {
    aviso.confirmar({
      sello: 'DIRECCIONES',
      titulo: 'Eliminar dirección',
      texto: `¿Quieres eliminar ${nombre}?`,
      confirmar: 'ELIMINAR',
      peligro: true,
      exito: {
        titulo: 'Dirección eliminada',
        texto: `${nombre} fue eliminada.`,
      },
      onConfirmar: async () => {
        onActualizado(await eliminarDireccion(userId, index));
      },
    });
  };

  const direccion = indiceEdicion === null ? undefined : perfil.addresses[indiceEdicion];
  const valores =
    direccion === undefined
      ? undefined
      : {
          name: direccion.name ?? '',
          address: direccion.address ?? '',
          neighborhood: direccion.neighborhood ?? '',
          is_primary: Boolean(direccion.is_primary),
        };

  return {
    formularioAbierto: mostrarForm || indiceEdicion !== null,
    mostrarAccion: !(mostrarForm || indiceEdicion !== null),
    abrirFormulario,
    editar,
    cancelar,
    guardar,
    guardando,
    error,
    valores,
    marcarPrincipal,
    eliminar,
  };
}
