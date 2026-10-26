import { Platform, Text, View } from 'react-native';

import Button from '@/components/Button';

type Props = {
  busy?: boolean;
  disabled?: boolean;
  onPress: () => void;
  showHint?: boolean;
};

/** Se comparte entre los dos formularios de login y la sesión guardada bloqueada. */
export function BiometricLoginButton({ busy, disabled, onPress, showHint }: Props) {
  if (Platform.OS !== 'android') return null;

  return (
    <View className="gap-2">
      <Button
        variant="secondary"
        text={busy ? 'VERIFICANDO...' : 'INGRESAR CON HUELLA'}
        onPress={onPress}
        disabled={disabled || busy}
      />
      {showHint ? (
        <Text className="text-center font-roboto text-xs leading-5 text-madera">
          Entra primero con tu contraseña y activa este acceso en Ajustes para usarlo al volver.
        </Text>
      ) : (
        <Text className="text-center font-roboto text-xs leading-5 text-madera">
          Acceso biométrico activado en este dispositivo.
        </Text>
      )}
    </View>
  );
}
