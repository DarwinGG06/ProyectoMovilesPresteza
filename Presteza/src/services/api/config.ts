import { Platform } from 'react-native';

const DESDE_ENV = process.env.EXPO_PUBLIC_API_URL;

export const API_URL =
  DESDE_ENV ??
  (Platform.OS === 'web' ? 'http://localhost:4000' : 'http://192.168.1.52:4000');
