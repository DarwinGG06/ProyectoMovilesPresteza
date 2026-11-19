import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';

import { obtenerUsuario } from '@/api/perfil';
import { useSession } from '@/session/context';

import { escucharCambioCumpleanios, sincronizarAvisoCumpleanios } from './cumpleanios';

export function useAvisoCumpleanios() {
  const { user, token } = useSession();
  const usuarioId = user?.id;
  const rol = user?.role;

  useEffect(() => {
    if (Platform.OS === 'web' || !usuarioId || !token || rol !== 'client') return;
    let vivo = true;
    let consultando = false;
    let repetir = false;
    const revisar = async () => {
      if (!vivo || AppState.currentState !== 'active') return;
      if (consultando) {
        repetir = true;
        return;
      }
      consultando = true;
      try {
        const perfil = await obtenerUsuario(usuarioId);
        if (vivo) await sincronizarAvisoCumpleanios(perfil);
      } catch (error) {
        // Sin red conservamos la programación anterior; no inventamos elegibilidad.
        console.warn('No se pudo actualizar el aviso de cumpleaños', error);
      } finally {
        consultando = false;
        if (vivo && repetir) {
          repetir = false;
          void revisar();
        }
      }
    };
    void revisar();
    const timer = setInterval(() => void revisar(), 60_000);
    const evento = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') void revisar();
    });
    const dejarDeEscuchar = escucharCambioCumpleanios(() => void revisar());
    return () => {
      vivo = false;
      clearInterval(timer);
      evento.remove();
      dejarDeEscuchar();
      // No cancelar al desmontar: también ocurre al bloquearse con huella.
    };
  }, [usuarioId, token, rol]);
}
