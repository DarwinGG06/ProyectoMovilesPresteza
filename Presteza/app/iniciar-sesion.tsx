import { Link, router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Text, View } from 'react-native';

import Button from '@/components/Button';
import Field from '@/components/Field';
import MensajeError from '@/components/MensajeError';
import { useSession } from '@/session/context';
import { ContenedorPantalla } from '@/shared/components/contenedor-pantalla/ContenedorPantalla';

/** Los datos que captura este formulario. */
type LoginForm = { email: string; password: string };

export default function IniciarSesion() {
  const { signIn } = useSession();

  // `control` conecta los campos, `handleSubmit` valida antes de enviar y
  // `formState` trae los errores y si se está enviando en este momento.
  const { control, handleSubmit, setError, formState } = useForm<LoginForm>({
    defaultValues: { email: '', password: '' },
  });

  const submit = async ({ email, password }: LoginForm) => {
    try {
      await signIn(email, password);
      router.replace('/perfil');
    } catch (error) {
      // `root` es el error del formulario completo (credenciales malas, servidor
      // caído...), a diferencia del error de un campo concreto.
      setError('root', { message: (error as Error).message });
    }
  };

  return (
    <ContenedorPantalla titulo="Iniciar sesión">
      <Text className="mt-3 text-base text-texto/70">Entra con el correo que registraste.</Text>

      <View className="mt-8 gap-5">
        <Field
          control={control}
          name="email"
          label="Correo"
          keyboardType="email-address"
          placeholder="tu@email.com"
          maxLength={120}
          rules={{
            required: 'El correo es obligatorio',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Correo inválido' },
            maxLength: { value: 120, message: 'Máximo 120 caracteres' },
          }}
        />
        <Field
          control={control}
          name="password"
          label="Contraseña"
          secureTextEntry
          placeholder="••••••••"
          maxLength={72}
          rules={{
            required: 'La contraseña es obligatoria',
            maxLength: { value: 72, message: 'Máximo 72 caracteres' },
          }}
        />

        <MensajeError texto={formState.errors.root?.message} />

        <Button
          text={formState.isSubmitting ? 'ENTRANDO…' : 'ENTRAR'}
          onPress={handleSubmit(submit)}
          disabled={formState.isSubmitting}
        />

        <Link href="/recuperar-contrasena" className="text-center text-sm text-marca">
          ¿Olvidaste tu contraseña?
        </Link>
        <Link href="/registro" className="text-center text-sm text-marca">
          ¿No tienes cuenta? Regístrate
        </Link>
      </View>
    </ContenedorPantalla>
  );
}
