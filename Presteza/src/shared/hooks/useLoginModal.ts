import { router } from 'expo-router';
import { useForm } from 'react-hook-form';

import { useSession } from '@/session/context';

type LoginForm = { email: string; password: string };

export function useLoginModal(onClose: () => void) {
  const { signIn } = useSession();
  const { control, handleSubmit, reset, setError, formState } = useForm<LoginForm>({
    defaultValues: { email: '', password: '' },
  });

  const close = () => {
    reset();
    onClose();
  };

  const entrar = handleSubmit(async ({ email, password }) => {
    try {
      await signIn(email, password);
      close();
      router.replace('/perfil');
    } catch (error) {
      setError('root', { message: (error as Error).message });
    }
  });

  return {
    control,
    close,
    entrar,
    irARecuperar: () => {
      close();
      router.push('/recuperar-contrasena');
    },
    irARegistro: () => {
      close();
      router.push('/registro');
    },
    error: formState.errors.root?.message,
    enviando: formState.isSubmitting,
  };
}
