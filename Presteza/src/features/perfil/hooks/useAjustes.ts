import { router } from 'expo-router';
import { useState } from 'react';

import { actualizarPerfilApi } from '@/api/perfil';
import { useAviso } from '@/shared/components/aviso';

import type { ContrasenaForm, PerfilForm, UsuarioPerfil } from '../types';

type UseAjustesParams = {
  userId: string;
  perfil: UsuarioPerfil;
  onActualizado: (perfil: UsuarioPerfil) => void;
  onCerrarSesion: () => void;
};

export function useAjustes({ userId, perfil, onActualizado, onCerrarSesion }: UseAjustesParams) {
  const [editando, setEditando] = useState(false);
  const [cambiandoClave, setCambiandoClave] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const aviso = useAviso();

  const editar = () => setEditando(true);
  const cancelar = () => setEditando(false);
  const empezarClave = () => setCambiandoClave(true);
  const cancelarClave = () => setCambiandoClave(false);

  const guardarDatos = async (datos: PerfilForm) => {
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      onActualizado(await actualizarPerfilApi(userId, datos));
      setEditando(false);
      setMensaje('Información actualizada.');
      aviso.ok('Datos editados', 'Tu información fue editada.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar.');
    } finally {
      setGuardando(false);
    }
  };

  const guardarClave = async (datos: ContrasenaForm) => {
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      await actualizarPerfilApi(userId, { password: datos.newPassword });
      setCambiandoClave(false);
      setMensaje('Contraseña actualizada.');
      aviso.ok('Contraseña editada', 'Tu contraseña fue cambiada.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cambiar la contraseña.');
    } finally {
      setGuardando(false);
    }
  };

  const cerrarSesion = () => {
    aviso.confirmar({
      sello: 'SESIÓN',
      titulo: 'Cerrar sesión',
      texto: '¿Quieres salir de tu cuenta?',
      confirmar: 'SALIR',
      peligro: true,
      onConfirmar: () => {
        onCerrarSesion();
        router.push('/');
      },
    });
  };

  return {
    editando,
    editar,
    cancelar,
    cambiandoClave,
    empezarClave,
    cancelarClave,
    guardarDatos,
    guardarClave,
    guardando,
    mensaje,
    error,
    cerrarSesion,
    valores: {
      complete_name: perfil.complete_name,
      email: perfil.email,
      phone_number: perfil.phone_number,
    },
  };
}
