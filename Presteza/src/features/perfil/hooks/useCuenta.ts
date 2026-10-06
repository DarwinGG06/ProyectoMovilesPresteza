import { useState } from 'react';

import { actualizarPerfilApi } from '@/api/perfil';

import type { PerfilForm, UsuarioPerfil } from '../types';

type UseCuentaParams = {
  userId: string;
  perfil: UsuarioPerfil;
  onActualizado: (perfil: UsuarioPerfil) => void;
};

export function useCuenta({ userId, perfil, onActualizado }: UseCuentaParams) {
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const editar = () => setEditando(true);
  const cancelar = () => setEditando(false);

  const guardar = async (datos: PerfilForm) => {
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      const actualizado = await actualizarPerfilApi(userId, datos);
      onActualizado(actualizado);
      setEditando(false);
      setMensaje('Datos actualizados.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar.');
    } finally {
      setGuardando(false);
    }
  };

  return {
    editando,
    editar,
    cancelar,
    guardar,
    guardando,
    mensaje,
    error,
    valores: {
      complete_name: perfil.complete_name,
      email: perfil.email,
      phone_number: perfil.phone_number,
    },
  };
}
