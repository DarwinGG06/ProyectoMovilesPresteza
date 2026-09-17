import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Modal, Platform, Pressable, Text, View } from 'react-native';

import { useSession } from '@/session/context';
import Button from '@/components/Button';
import Field from '@/components/Field';
import MensajeError from '@/components/MensajeError';

import { IconoNav } from './IconoNav';
import { SelloP } from './SelloP';

type LoginForm = { email: string; password: string };

type LoginModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function LoginModal({ visible, onClose }: LoginModalProps) {
  const { signIn } = useSession();
  const { control, handleSubmit, reset, setError, formState } = useForm<LoginForm>({
    defaultValues: { email: '', password: '' },
  });

  const close = () => {
    reset();
    onClose();
  };

  const submit = async ({ email, password }: LoginForm) => {
    try {
      await signIn(email, password);
      close();
      router.replace('/perfil');
    } catch (error) {
      setError('root', { message: (error as Error).message });
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <Pressable onPress={close} className="flex-1 items-center justify-center bg-marca-oscura/70 px-5">
          <Pressable onPress={() => {}} className="w-full overflow-hidden bg-marca-oscura">
            <View className="h-1 w-full bg-oro" />
            <View className="p-6">
              <Pressable
                onPress={close}
                className="absolute right-5 top-5 z-10 h-9 w-9 items-center justify-center rounded-full border border-oro/40">
                <IconoNav name="close" size={16} className="text-oro" />
              </Pressable>

              <View className="mb-6 items-center pt-3">
                <SelloP size="lg" />
                <Text className="mt-4 text-[11px] tracking-[4px] text-oro">INICIAR SESIÓN</Text>
                <Text className="mt-1 text-3xl font-extrabold text-crema">Bienvenido</Text>
              </View>

              <View className="bg-crema px-4 py-5">
                <View className="gap-4">
                  <Field
                    control={control}
                    name="email"
                    label="Correo"
                    placeholder="tu@email.com"
                    keyboardType="email-address"
                    rules={{
                      required: 'El correo es obligatorio',
                      pattern: { value: /^\S+@\S+\.\S+$/, message: 'Correo inválido' },
                      maxLength: { value: 120, message: 'Máximo 120 caracteres' },
                    }}
                    maxLength={120}
                  />
                  <Field
                    control={control}
                    name="password"
                    label="Contraseña"
                    placeholder="••••••••"
                    secureTextEntry
                    rules={{
                      required: 'La contraseña es obligatoria',
                      maxLength: { value: 72, message: 'Máximo 72 caracteres' },
                    }}
                    maxLength={72}
                  />
                </View>

                <MensajeError className="mt-3" texto={formState.errors.root?.message} />

                <Button
                  className="mt-5"
                  text={formState.isSubmitting ? 'ENTRANDO…' : 'ENTRAR'}
                  onPress={handleSubmit(submit)}
                  disabled={formState.isSubmitting}
                />
              </View>

              <Pressable
                onPress={() => {
                  close();
                  router.push('/recuperar-contrasena');
                }}
                className="mb-5 mt-4 self-end">
                <Text className="text-xs tracking-wide text-oro">¿Olvidaste tu contraseña?</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  close();
                  router.push('/registro');
                }}>
                <Text className="text-center text-crema/70">
                  ¿Primera vez? <Text className="font-bold text-oro">Regístrate</Text>
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
