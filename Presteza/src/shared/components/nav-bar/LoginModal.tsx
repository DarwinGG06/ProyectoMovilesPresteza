import { router } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Modal, Platform, Pressable, Text, View } from 'react-native';

import { useAuth } from '@/auth/AuthContext';

import Field from '../../../../components/Field';
import { IconoNav } from './IconoNav';
import { SelloP } from './SelloP';

type LoginForm = {
  email: string;
  password: string;
};

type LoginModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function LoginModal({ visible, onClose }: LoginModalProps) {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const { control, handleSubmit, reset } = useForm<LoginForm>({
    defaultValues: { email: '', password: '' },
  });

  const close = () => {
    reset();
    setError(null);
    onClose();
  };

  const submit = handleSubmit(async (datos) => {
    setError(null);
    try {
      await login(datos.email, datos.password);
      close();
      router.push('/perfil');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión.');
    }
  });

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

              {error ? (
                <Text className="mb-3 text-center text-sm text-red-300">{error}</Text>
              ) : null}

              <FormularioLogin control={control} onSubmit={submit} />

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

function FormularioLogin({
  control,
  onSubmit,
}: {
  control: ReturnType<typeof useForm<LoginForm>>['control'];
  onSubmit: () => void;
}) {
  return (
    <View className="bg-crema px-4 py-5">
      <View className="gap-4">
        <Field
          control={control}
          name="email"
          label="Correo"
          placeholder="tu@email.com"
          keyboardType="email-address"
          rules={{ required: 'Escribe tu correo' }}
        />
        <Field
          control={control}
          name="password"
          label="Contraseña"
          placeholder="Contraseña"
          secureTextEntry
          rules={{ required: 'Escribe tu contraseña' }}
        />
      </View>
      <Pressable onPress={onSubmit} className="mt-5 bg-marca-oscura py-4">
        <Text className="text-center text-[11px] tracking-[3px] text-crema">ENTRAR</Text>
      </Pressable>
    </View>
  );
}
