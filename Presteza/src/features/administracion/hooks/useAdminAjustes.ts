import { router } from 'expo-router';
import { useCallback, useState } from 'react';

import { actualizarPerfilApi } from '@/features/perfil/api/perfilApi';

import type { AjustesForm } from '../types';
import { useSesionAdmin } from './adminComun';

export function useAdminAjustes() {
  const { user, logout, actualizarUsuario, aviso } = useSesionAdmin();
  const [guardando, setGuardando] = useState(false);

  const guardar = useCallback(
    async (datos: AjustesForm) => {
      if (!user) return false;
      setGuardando(true);
      try {
        const actualizado = await actualizarPerfilApi(user.id, {
          complete_name: datos.name.trim(),
          email: datos.email.trim(),
          phone_number: datos.phone.trim(),
        });
        actualizarUsuario({
          name: actualizado.complete_name || datos.name.trim(),
          email: actualizado.email || datos.email.trim(),
          phone: actualizado.phone_number || datos.phone.trim(),
        });
        aviso.ok('Cuenta editada', 'Tu usuario fue editado.');
        return true;
      } catch (err) {
        aviso.errorDe(err, 'No se pudo guardar.', 'Ajustes');
        return false;
      } finally {
        setGuardando(false);
      }
    },
    [actualizarUsuario, aviso, user],
  );

  const salir = useCallback(() => {
    aviso.confirmar({
      sello: 'SESIÓN',
      titulo: 'Cerrar sesión',
      texto: '¿Quieres salir de la casa?',
      confirmar: 'SALIR',
      peligro: true,
      onConfirmar: () => {
        logout();
        router.push('/');
      },
    });
  }, [aviso, logout]);

  return { guardar, salir, guardando };
}
