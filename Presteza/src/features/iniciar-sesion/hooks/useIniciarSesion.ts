import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useAuth } from '@/auth/AuthContext';
import { logError, logInfo } from '@/services/api/logger';

export type LoginForm = {
  email: string;
  password: string;
};

export function useIniciarSesion() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const { control, handleSubmit } = useForm<LoginForm>({
    defaultValues: { email: '', password: '' },
  });

  const enviar = handleSubmit(async (datos) => {
    setError(null);
    setEnviando(true);
    logInfo('ui', 'IniciarSesionScreen enviar', { email: datos.email.trim().toLowerCase() });
    try {
      await login(datos.email, datos.password);
      logInfo('ui', 'IniciarSesionScreen OK, yendo a /perfil');
      router.push('/perfil');
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'No se pudo iniciar sesión.';
      logError('ui', 'IniciarSesionScreen error', { mensaje });
      setError(mensaje);
    } finally {
      setEnviando(false);
    }
  });

  const irARegistro = useCallback(() => {
    router.push('/registro');
  }, []);

  return { control, error, enviando, enviar, irARegistro };
}
