import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const SESSION_KEY = 'presteza.session.token';
const BIOMETRIC_USER_KEY = 'presteza.session.biometric-user';
const BIOMETRIC_TOKEN_KEY = 'presteza.session.biometric-token';

// Serializa escrituras y borrados para que un logout nunca quede detrás de un login.
let pendingWrite: Promise<void> = Promise.resolve();

export async function readSessionToken(): Promise<string | null> {
  await pendingWrite;
  if (Platform.OS === 'web') {
    return typeof window === 'undefined' ? null : window.localStorage.getItem(SESSION_KEY);
  }
  return SecureStore.getItemAsync(SESSION_KEY);
}

export function writeSessionToken(token: string | null): Promise<void> {
  const operation = pendingWrite.then(async () => {
    if (Platform.OS === 'web') {
      if (token === null) window.localStorage.removeItem(SESSION_KEY);
      else window.localStorage.setItem(SESSION_KEY, token);
    } else if (token === null) {
      await SecureStore.deleteItemAsync(SESSION_KEY);
    } else {
      await SecureStore.setItemAsync(SESSION_KEY, token);
    }
  });
  pendingWrite = operation.catch(() => {});
  return operation;
}

/** La preferencia pertenece a una cuenta y a este dispositivo; nunca contiene una huella. */
export async function readBiometricUser(): Promise<string | null> {
  await pendingWrite;
  if (Platform.OS === 'web') return null;
  return SecureStore.getItemAsync(BIOMETRIC_USER_KEY);
}

async function removeStoredKey(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    // Borrar una clave que ya no está no debe impedir borrar la otra.
    if ((await SecureStore.getItemAsync(key)) !== null) throw error;
  }
}

async function restoreStoredKey(key: string, value: string | null): Promise<void> {
  if (value === null) await removeStoredKey(key);
  else await SecureStore.setItemAsync(key, value);
}

export function writeBiometricUser(userId: string | null): Promise<void> {
  const operation = pendingWrite.then(async () => {
    if (Platform.OS === 'web') return;
    if (userId === null) {
      await removeStoredKey(BIOMETRIC_USER_KEY);
      await removeStoredKey(BIOMETRIC_TOKEN_KEY);
    } else await SecureStore.setItemAsync(BIOMETRIC_USER_KEY, String(userId));
  });
  pendingWrite = operation.catch(() => {});
  return operation;
}

/** Credencial recordada: no restaura la sesión automáticamente después de un logout. */
export async function readBiometricToken(): Promise<string | null> {
  await pendingWrite;
  if (Platform.OS === 'web') return null;
  return SecureStore.getItemAsync(BIOMETRIC_TOKEN_KEY);
}

/**
 * Guarda la credencial antes de marcar la cuenta como habilitada.
 * Si el guardado falla, recupera la pareja anterior: actualizar el token no
 * puede dejar la huella activada sin credencial, ni borrar una que ya servía.
 */
export function writeBiometricAccess(userId: string, token: string): Promise<void> {
  const operation = pendingWrite.then(async () => {
    if (Platform.OS === 'web') return;
    const previousUser = await SecureStore.getItemAsync(BIOMETRIC_USER_KEY);
    const previousToken = await SecureStore.getItemAsync(BIOMETRIC_TOKEN_KEY);
    try {
      await SecureStore.setItemAsync(BIOMETRIC_TOKEN_KEY, token);
      await SecureStore.setItemAsync(BIOMETRIC_USER_KEY, String(userId));
    } catch (error) {
      try {
        await restoreStoredKey(BIOMETRIC_TOKEN_KEY, previousToken);
        await restoreStoredKey(BIOMETRIC_USER_KEY, previousUser);
      } catch {
        // La activación nueva sigue siendo un error aunque no se pueda restaurar.
      }
      throw error;
    }
  });
  pendingWrite = operation.catch(() => {});
  return operation;
}
