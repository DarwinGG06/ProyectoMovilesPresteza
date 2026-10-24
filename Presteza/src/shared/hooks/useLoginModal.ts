import { router } from 'expo-router';
import { useForm } from 'react-hook-form';

import { useSession } from '@/session/context';

type LoginForm = { email: string; password: string };

export function useLoginModal(onClose: () => void) {
  const { signIn, signInWithBiometrics, biometricSupport, biometricBusy, biometricEnabled } =
    useSession();
  const { control, handleSubmit, reset, setError, clearErrors, formState } = useForm<LoginForm>({
    defaultValues: { email: '', password: '' },
  });

  const close = () => {
    if (biometricBusy || formState.isSubmitting) return;
    reset();
    onClose();
  };

  const entrarConBiometria = async () => {
    if (biometricBusy || formState.isSubmitting) return;
    clearErrors('root');
    try {
      await signInWithBiometrics();
      reset();
      onClose();
      router.replace('/perfil');
    } catch (error) {
      setError('root', {
        message: error instanceof Error ? error.message : 'No se pudo iniciar sesión.',
      });
    }
  };

  const entrar = handleSubmit(async ({ email, password }) => {
    try {
      await signIn(email, password);
      reset();
      onClose();
      router.replace('/perfil');
    } catch (error) {
      setError('root', { message: (error as Error).message });
    }
  });

  return {
    control,
    close,
    entrar,
    entrarConBiometria,
    biometricSupport,
    biometricBusy,
    biometricEnabled,
    irARecuperar: () => {
      if (biometricBusy || formState.isSubmitting) return;
      close();
      router.push('/recuperar-contrasena');
    },
    irARegistro: () => {
      if (biometricBusy || formState.isSubmitting) return;
      close();
      router.push('/registro');
    },
    error: formState.errors.root?.message,
    enviando: formState.isSubmitting || biometricBusy,
  };
}
