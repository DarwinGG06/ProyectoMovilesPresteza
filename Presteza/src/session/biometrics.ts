import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

export type BiometricSupport = {
  available: boolean;
  label: string;
  reason: string;
};

export async function getBiometricSupport(): Promise<BiometricSupport> {
  if (Platform.OS === 'web') {
    return {
      available: false,
      label: 'Huella o rostro',
      reason: 'Disponible en la app de Android o iOS.',
    };
  }

  const [hardware, enrolled, types] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
    LocalAuthentication.supportedAuthenticationTypesAsync(),
  ]);
  const fingerprint = types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT);
  const label = fingerprint ? 'Huella digital' : 'Reconocimiento facial';
  if (!hardware) {
    return {
      available: false,
      label,
      reason: 'Este dispositivo no tiene un sensor biométrico compatible.',
    };
  }
  if (!enrolled) {
    return {
      available: false,
      label,
      reason: 'Primero registra tu huella o rostro en los ajustes del teléfono.',
    };
  }
  if (
    Platform.OS === 'android' &&
    (await LocalAuthentication.getEnrolledLevelAsync()) <
      LocalAuthentication.SecurityLevel.BIOMETRIC_STRONG
  ) {
    return {
      available: false,
      label,
      reason: 'Configura una huella o un método biométrico de alta seguridad en el teléfono.',
    };
  }
  return { available: true, label, reason: '' };
}

export async function authenticateDevice(promptMessage = 'Desbloquear Presteza'): Promise<void> {
  if (Platform.OS === 'web') throw new Error('La biometría está disponible en la app móvil.');
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    promptSubtitle: 'Confirma tu identidad para continuar',
    promptDescription: 'Usa tu huella, rostro o el bloqueo de pantalla del teléfono.',
    cancelLabel: 'Cancelar',
    fallbackLabel: 'Usar código del teléfono',
    disableDeviceFallback: false,
    biometricsSecurityLevel: 'strong',
  });
  if (result.success) return;

  const messages: Record<string, string> = {
    user_cancel: 'Verificación cancelada. Puedes intentarlo de nuevo o usar tu contraseña.',
    app_cancel: 'La verificación se interrumpió. Inténtalo de nuevo.',
    system_cancel: 'La verificación se interrumpió. Inténtalo de nuevo.',
    lockout: 'Demasiados intentos. Usa el código del teléfono o tu contraseña de Presteza.',
    not_enrolled: 'No hay una huella o rostro registrado. Usa tu contraseña de Presteza.',
    not_available: 'La biometría no está disponible. Usa tu contraseña de Presteza.',
    passcode_not_set:
      'Configura el bloqueo de pantalla del teléfono o usa tu contraseña de Presteza.',
    timeout: 'Se agotó el tiempo de verificación. Inténtalo de nuevo.',
    authentication_failed: 'No se pudo confirmar tu identidad. Inténtalo de nuevo.',
    user_fallback: 'Usa tu contraseña de Presteza para continuar.',
  };
  throw new Error(
    messages[result.error] ?? 'No se pudo verificar tu identidad. Usa tu contraseña de Presteza.'
  );
}
