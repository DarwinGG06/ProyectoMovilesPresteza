import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useAuth } from '@/auth/AuthContext';
import { logError, logInfo } from '@/services/api/logger';

export type RegistroForm = {
  complete_name: string;
  email: string;
  phone_number: string;
  password: string;
  confirmar: string;
};

export function useRegistro() {
  const { register } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const { control, handleSubmit, getValues } = useForm<RegistroForm>({
    defaultValues: {
      complete_name: '',
      email: '',
      phone_number: '',
      password: '',
      confirmar: '',
    },
  });

  const enviar = handleSubmit(async (datos) => {
    setError(null);
    setEnviando(true);
    logInfo('ui', 'RegistroScreen enviar', { email: datos.email.trim().toLowerCase() });
    try {
      await register({
        complete_name: datos.complete_name,
        email: datos.email,
        phone_number: datos.phone_number,
        password: datos.password,
      });
      logInfo('ui', 'RegistroScreen OK, yendo a /perfil');
      router.push('/perfil');
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'No se pudo registrar.';
      logError('ui', 'RegistroScreen error', { mensaje });
      setError(mensaje);
    } finally {
      setEnviando(false);
    }
  });

  const irAIniciarSesion = useCallback(() => {
    router.push('/iniciar-sesion');
  }, []);

  return { control, error, enviando, enviar, getValues, irAIniciarSesion };
}
