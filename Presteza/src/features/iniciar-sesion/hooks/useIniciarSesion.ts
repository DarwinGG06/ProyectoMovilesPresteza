import { router } from 'expo-router';
import { useForm } from 'react-hook-form';

import { useSession } from '@/session/context';

export type LoginForm = { email: string; password: string };

export function useIniciarSesion() {
  const { signIn } = useSession();
  const { control, handleSubmit, setError, formState } = useForm<LoginForm>({
    defaultValues: { email: '', password: '' },
  });

  const entrar = handleSubmit(async ({ email, password }) => {
    try {
      await signIn(email, password);
      router.replace('/perfil');
    } catch (error) {
      // `root` es el error del formulario completo (credenciales malas, servidor
      // caído...), a diferencia del error de un campo concreto.
      setError('root', { message: error instanceof Error ? error.message : 'No se pudo iniciar sesión.' });
    }
  });

  return {
    control,
    error: formState.errors.root?.message,
    enviando: formState.isSubmitting,
    entrar,
  };
}
