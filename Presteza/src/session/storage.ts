import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const SESSION_KEY = 'presteza.session.token';
const BIOMETRIC_USER_KEY = 'presteza.session.biometric-user';

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

export function writeBiometricUser(userId: string | null): Promise<void> {
  const operation = pendingWrite.then(async () => {
    if (Platform.OS === 'web') return;
    if (userId === null) await SecureStore.deleteItemAsync(BIOMETRIC_USER_KEY);
    else await SecureStore.setItemAsync(BIOMETRIC_USER_KEY, userId);
  });
  pendingWrite = operation.catch(() => {});
  return operation;
}
