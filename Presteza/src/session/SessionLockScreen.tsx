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
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '@/components/Button';
import { Pergamino } from '@/shared/components/materiales/Pergamino';

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
    <Pergamino fill>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 28,
              paddingVertical: 40,
            }}
            keyboardShouldPersistTaps="handled">
            <View className="w-full max-w-md">
              <View className="mb-8 items-center">
                <Text className="font-roboto text-[10px] tracking-[4px] text-marca">PRESTEZA</Text>
                <View className="my-7">
                  {busy || passwordBusy ? (
                    <ActivityIndicator size="large" color="#6b1d3d" />
                  ) : (
                    <Ionicons
                      name={passwordMode ? 'lock-closed-outline' : 'finger-print-outline'}
                      size={40}
                      color="#6b1d3d"
                    />
                  )}
                </View>
                <Text
                  accessibilityRole="header"
                  className="text-center font-serif-light text-[40px] leading-[44px] text-tinta">
                  Desbloquea tu cuenta
                </Text>
                <View className="my-5 h-px w-12 bg-marca/30" />
                <Text className="text-center font-roboto-light text-base leading-6 text-madera">
                  {passwordMode
                    ? 'Ingresa tu contraseña de Presteza para continuar.'
                    : 'Usa tu huella, rostro o el bloqueo de pantalla del teléfono para continuar.'}
                </Text>
              </View>

              {passwordMode ? (
                <View className="gap-5">
                  <Text className="font-roboto text-sm text-madera">{email}</Text>
                  <View>
                    <Text className="font-roboto text-[10px] tracking-[2px] text-marca">
                      CONTRASEÑA
                    </Text>
                    <TextInput
                      accessibilityLabel="Contraseña de Presteza"
                      placeholder="Contraseña de Presteza"
                      placeholderTextColor="#8c7566"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="current-password"
                      textContentType="password"
                      returnKeyType="go"
                      editable={!disabled}
                      onSubmitEditing={() => void submit()}
                      className="border-b border-madera/25 bg-transparent px-0 py-3 font-roboto-light text-[17px] text-tinta"
                    />
                  </View>
                  <Button
                    variant="gold"
                    disabled={disabled || !password}
                    onPress={() => void submit()}
                    text={passwordBusy ? 'ENTRANDO...' : 'ENTRAR CON CONTRASEÑA'}
                  />
                </View>
              ) : (
                <Button
                  variant="gold"
                  disabled={disabled}
                  onPress={() => void onUnlock()}
                  text={busy ? 'VERIFICANDO...' : `USAR ${label.toUpperCase()}`}
                />
              )}

              {(passwordMode ? passwordError : error) ? (
                <Text
                  accessibilityRole="alert"
                  className="mt-4 text-center font-roboto text-sm leading-5 text-red-700">
                  {passwordMode ? passwordError : error}
                </Text>
              ) : null}
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled }}
                disabled={disabled}
                onPress={() => setPasswordMode(!passwordMode)}
                className="mt-4 p-4 active:opacity-70 disabled:opacity-40">
                <Text className="text-center font-roboto text-sm text-marca">
                  {passwordMode ? 'Volver al desbloqueo biométrico' : 'Usar contraseña de Presteza'}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled }}
                disabled={disabled}
                onPress={onSignOut}
                className="p-4 active:opacity-70 disabled:opacity-40">
                <Text className="text-center font-roboto text-sm text-madera">Cerrar sesión</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Pergamino>
  );
}
