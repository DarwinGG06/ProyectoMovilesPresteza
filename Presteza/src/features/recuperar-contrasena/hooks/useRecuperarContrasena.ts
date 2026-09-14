import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { forgotPasswordApi } from '@/auth/authApi';

export type RecuperarForm = {
  email: string;
};

export function useRecuperarContrasena() {
  const [listo, setListo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { control, handleSubmit } = useForm<RecuperarForm>({
    defaultValues: { email: '' },
  });

  const enviar = handleSubmit(async (datos) => {
    setError(null);
    setListo(null);
    try {
      const respuesta = await forgotPasswordApi(datos.email);
      setListo(respuesta.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el correo.');
    }
  });

  return { control, listo, error, enviar };
}
