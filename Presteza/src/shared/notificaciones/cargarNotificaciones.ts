import { isRunningInExpoGo } from 'expo';
import { Platform } from 'react-native';

export type ExpoNotifications = typeof import('expo-notifications');

let cached: ExpoNotifications | null | undefined;
let handlerListo = false;

/** En Expo Go no se carga el nativo (crash ExpoTopicSubscriptionModule). */
export function getNotifications(): ExpoNotifications | null {
  if (Platform.OS === 'web' || isRunningInExpoGo()) return null;
  if (cached !== undefined) return cached;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('expo-notifications') as ExpoNotifications;
    if (!handlerListo) {
      mod.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
      handlerListo = true;
    }
    cached = mod;
    return cached;
  } catch {
    cached = null;
    return null;
  }
}
