import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { resetPassword } from '@/api/auth';

export type ResetForm = {
  token: string;
  newPassword: string;
};

export function useRestablecerContrasena() {
  const params = useLocalSearchParams<{ token?: string }>();
  const [error, setError] = useState<string | null>(null);
  const { control, handleSubmit } = useForm<ResetForm>({
    defaultValues: { token: params.token ?? '', newPassword: '' },
  });

  const enviar = handleSubmit(async (datos) => {
    setError(null);
    try {
      await resetPassword(datos.token, datos.newPassword);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cambiar la contraseña.');
    }
  });

  return { control, error, enviar };
}
