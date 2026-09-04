import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '@/auth/AuthContext';

import { IconoNav } from './IconoNav';
import { SelloP } from './SelloP';

type LoginModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function LoginModal({ visible, onClose }: LoginModalProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setEmail('');
    setPassword('');
    setError(null);
    setLoading(false);
  };

  const close = () => {
    reset();
    onClose();
  };

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      close();
      router.push('/perfil');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión.');
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1">
        <Pressable onPress={close} className="flex-1 items-center justify-center bg-marca-oscura/70 px-5">
          <Pressable onPress={() => {}} className="w-full overflow-hidden rounded-[32px] bg-marca-oscura">
            <View className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-oro/15" />
            <View className="h-1 w-full bg-oro" />

            <View className="p-6">
              <Pressable
                onPress={close}
                className="absolute right-5 top-5 z-10 h-9 w-9 items-center justify-center rounded-full border border-oro/40">
                <IconoNav name="close" size={16} className="text-oro" />
              </Pressable>

              <View className="mb-7 items-center pt-3">
                <SelloP size="lg" />
                <Text className="mt-4 text-[11px] tracking-[4px] text-oro">BIENVENIDO</Text>
                <Text className="mt-1 text-3xl font-extrabold text-crema">Tu mesa te espera</Text>
              </View>

              {error ? (
                <View className="mb-4 rounded-2xl border border-red-300/40 bg-red-500/10 px-3 py-3">
                  <Text className="text-center text-sm text-red-200">{error}</Text>
                </View>
              ) : null}

              <Campo
                icono="mail-outline"
                value={email}
                onChangeText={setEmail}
                placeholder="tu@email.com"
                keyboardType="email-address"
                editable={!loading}
              />
              <Campo
                icono="lock-closed-outline"
                value={password}
                onChangeText={setPassword}
                placeholder="Contraseña"
                secureTextEntry
                editable={!loading}
              />

              <Pressable
                onPress={() => {
                  close();
                  router.push('/recuperar-contrasena');
                }}
                className="mb-5 self-end">
                <Text className="text-xs tracking-wide text-oro">¿Olvidaste tu contraseña?</Text>
              </Pressable>

              <Pressable
                onPress={submit}
                disabled={loading}
                className="mb-4 rounded-full bg-oro py-4 active:opacity-80">
                <Text className="text-center text-base font-extrabold tracking-widest text-marca-oscura">
                  {loading ? 'ENTRANDO...' : 'ENTRAR'}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  close();
                  router.push('/registro');
                }}>
                <Text className="text-center text-crema/70">
                  ¿Primera vez? <Text className="font-bold text-oro">Reserva tu lugar</Text>
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Campo({
  icono,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  editable,
}: {
  icono: 'mail-outline' | 'lock-closed-outline';
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: 'email-address';
  editable?: boolean;
}) {
  return (
    <View className="mb-3 flex-row items-center rounded-2xl border border-oro/25 bg-white/5 px-4">
      <IconoNav name={icono} size={18} className="text-oro" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(212,175,119,0.45)"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
        editable={editable}
        className="flex-1 py-4 pl-3 text-base text-crema"
      />
    </View>
  );
}
