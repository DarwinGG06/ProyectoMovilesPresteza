import { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';

import { useSession } from './context';

export function BiometricSettings() {
  const { biometricEnabled, biometricSupport, biometricBusy, setBiometricEnabled } = useSession();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggle = async () => {
    setMessage(null);
    setError(null);
    try {
      await setBiometricEnabled(!biometricEnabled);
      setMessage(
        biometricEnabled
          ? 'Desbloqueo biométrico desactivado.'
          : 'Desbloqueo activado en este teléfono. Se solicitará al volver a abrir Presteza.'
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cambiar el desbloqueo.');
    }
  };

  return (
    <View className="mt-6 gap-3 border-t border-oro/30 pt-5">
      <Text accessibilityRole="header" className="font-roboto-light text-2xl text-crema">
        Huella o rostro
      </Text>
      <Text className="font-roboto text-sm leading-6 text-crema">
        {biometricEnabled
          ? 'Activado. Al salir de la app, tu cuenta queda bloqueada hasta que confirmes tu identidad.'
          : 'Protege el acceso a tu cuenta al abrir la app o volver del segundo plano. También puedes usar el código del teléfono o tu contraseña de Presteza.'}
      </Text>
      <Text className="font-roboto text-sm leading-5 text-crema">
        Tu huella permanece en el teléfono. Presteza no la recibe ni la guarda.
      </Text>
      {!biometricSupport.available ? (
        <Text className="font-roboto text-sm text-oro">{biometricSupport.reason}</Text>
      ) : null}
      {Platform.OS !== 'web' ? (
        <Pressable
          accessibilityRole="button"
          disabled={biometricBusy}
          onPress={() => void toggle()}
          className="border border-oro px-4 py-4 disabled:opacity-50">
          <Text className="text-center font-roboto text-xs tracking-[2px] text-oro">
            {biometricBusy
              ? 'VERIFICANDO...'
              : biometricEnabled
                ? 'DESACTIVAR DESBLOQUEO'
                : 'ACTIVAR HUELLA O ROSTRO'}
          </Text>
        </Pressable>
      ) : null}
      {error || message ? (
        <Text accessibilityRole="alert" className="font-roboto text-sm leading-5 text-crema">
          {error || message}
        </Text>
      ) : null}
    </View>
  );
}
