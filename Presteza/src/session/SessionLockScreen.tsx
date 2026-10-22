import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

type Props = {
  email: string;
  label: string;
  busy: boolean;
  error: string | null;
  onUnlock: () => Promise<void>;
  onPassword: (password: string) => Promise<void>;
  onSignOut: () => void;
};

export function SessionLockScreen({
  email,
  label,
  busy,
  error,
  onUnlock,
  onPassword,
  onSignOut,
}: Props) {
  const [passwordMode, setPasswordMode] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const disabled = busy || passwordBusy;

  const submit = async () => {
    if (disabled || !password) return;
    setPasswordBusy(true);
    setPasswordError(null);
    try {
      await onPassword(password);
      setPassword('');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
    } finally {
      setPasswordBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-marca-oscura"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: 32,
          paddingVertical: 64,
        }}
        keyboardShouldPersistTaps="handled">
        <View className="mb-8 items-center">
          <View className="mb-6 h-20 w-20 items-center justify-center rounded-full border border-oro">
            <Ionicons name="lock-closed-outline" size={36} color="#d4af77" />
          </View>
          <Text className="font-roboto text-xs tracking-[4px] text-oro">PRESTEZA</Text>
          <Text
            accessibilityRole="header"
            className="mt-4 text-center font-roboto-light text-3xl text-crema">
            Desbloquea tu cuenta
          </Text>
          <Text className="mt-3 text-center font-roboto text-base leading-6 text-crema">
            {passwordMode
              ? 'Ingresa tu contraseña de Presteza para continuar.'
              : 'Usa tu huella, rostro o el bloqueo de pantalla del teléfono para continuar.'}
          </Text>
        </View>

        {passwordMode ? (
          <View className="gap-3">
            <Text className="font-roboto text-sm text-crema">{email}</Text>
            <TextInput
              accessibilityLabel="Contraseña de Presteza"
              placeholder="Contraseña de Presteza"
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
              editable={!disabled}
              onSubmitEditing={() => void submit()}
              className="rounded-lg bg-crema px-4 py-4 font-roboto text-base text-marca-oscura"
            />
            <Pressable
              accessibilityRole="button"
              disabled={disabled || !password}
              onPress={() => void submit()}
              className="rounded-lg bg-oro p-4 disabled:opacity-50">
              <Text className="text-center font-roboto-bold text-marca-oscura">
                {passwordBusy ? 'ENTRANDO...' : 'ENTRAR CON CONTRASEÑA'}
              </Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            disabled={disabled}
            onPress={() => void onUnlock()}
            className="flex-row items-center justify-center gap-3 rounded-lg bg-oro p-4 disabled:opacity-50">
            {busy ? (
              <ActivityIndicator color="#3a0c20" />
            ) : (
              <Ionicons name="finger-print-outline" size={26} color="#3a0c20" />
            )}
            <Text className="font-roboto-bold text-marca-oscura">
              {busy ? 'VERIFICANDO...' : `USAR ${label.toUpperCase()}`}
            </Text>
          </Pressable>
        )}

        {(passwordMode ? passwordError : error) ? (
          <Text
            accessibilityRole="alert"
            className="mt-4 text-center font-roboto text-sm text-crema">
            {passwordMode ? passwordError : error}
          </Text>
        ) : null}
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPress={() => setPasswordMode(!passwordMode)}
          className="mt-4 p-4">
          <Text className="text-center font-roboto text-sm text-oro">
            {passwordMode ? 'Volver al desbloqueo biométrico' : 'Usar contraseña de Presteza'}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPress={onSignOut}
          className="p-4">
          <Text className="text-center font-roboto text-sm text-crema">Cerrar sesión</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
