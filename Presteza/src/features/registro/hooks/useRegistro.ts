import { router } from 'expo-router';
import { useForm } from 'react-hook-form';

import { useSession } from '@/session/context';

export type RegisterForm = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmation: string;
};

export function useRegistro() {
  const { signUp } = useSession();
  const { control, handleSubmit, setError, getValues, formState } = useForm<RegisterForm>({
    defaultValues: { name: '', email: '', phone: '', password: '', confirmation: '' },
  });

  // `confirmation` no se envía: solo sirve para verificar que no hubo errata.
  const crearCuenta = handleSubmit(async ({ name, email, phone, password }) => {
    try {
      await signUp(name, email, password, phone);
      router.replace('/perfil');
    } catch (error) {
      setError('root', { message: error instanceof Error ? error.message : 'No se pudo crear la cuenta.' });
    }
  });

  const validarConfirmacion = (value: string) =>
    value === getValues('password') || 'Las contraseñas no coinciden';

  return {
    control,
    error: formState.errors.root?.message,
    enviando: formState.isSubmitting,
    crearCuenta,
    validarConfirmacion,
  };
}
