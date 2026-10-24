import { Platform, Text, View } from 'react-native';

import Button from '@/components/Button';

type Props = {
  label: string;
  busy?: boolean;
  disabled?: boolean;
  onPress: () => void;
  showHint?: boolean;
};

/** Se comparte entre los dos formularios de login y la sesión guardada bloqueada. */
export function BiometricLoginButton({ label, busy, disabled, onPress, showHint }: Props) {
  if (Platform.OS === 'web') return null;
  const faceID = Platform.OS === 'ios' && label === 'Face ID';

  return (
    <View className="gap-2">
      <Button
        variant="secondary"
        text={busy ? 'VERIFICANDO...' : faceID ? 'INGRESAR CON FACE ID' : 'INGRESAR CON HUELLA'}
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
