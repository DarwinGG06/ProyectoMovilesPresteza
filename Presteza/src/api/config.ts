import Constants from 'expo-constants';
import { NativeModules, Platform } from 'react-native';

import { logInfo, logWarn } from './logger';

const PUERTO_API = 4000;

function extraerHost(valor: string): string | null {
  const desdeUrl = valor.match(/^[a-z]+:\/\/([^:/]+)/i);
  if (desdeUrl?.[1]) return desdeUrl[1];

  const ip = valor.match(/(\d{1,3}(?:\.\d{1,3}){3})/);
  return ip?.[1] ?? null;
}

function esIpPrivada(host: string) {
  return /^10\./.test(host) || /^192\.168\./.test(host) || /^172\.(1[6-9]|2\d|3[0-1])\./.test(host);
}

function hostDesdeMetro(): string | null {
  const expoGo = Constants as { expoGoConfig?: { debuggerHost?: string } };
  const candidatos = [
    Constants.expoConfig?.hostUri,
    expoGo.expoGoConfig?.debuggerHost,
    Constants.linkingUri,
    NativeModules.SourceCode?.scriptURL as string | undefined,
  ];

  for (const valor of candidatos) {
    if (!valor) continue;
    const ip = String(valor).match(/(\d{1,3}(?:\.\d{1,3}){3})/);
    if (ip?.[1] && ip[1] !== '127.0.0.1') return ip[1];
  }

  return null;
}

function resolverApiUrl(): { url: string; origen: string } {
  const desdeEnv = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/$/, '');
  const hostEnv = desdeEnv ? extraerHost(desdeEnv) : null;
  const lan = hostDesdeMetro();

  const esRemoto = (host: string) =>
    !esIpPrivada(host) && host !== 'localhost' && host !== '127.0.0.1';

  if (Platform.OS === 'web') {
    const url = `http://localhost:${PUERTO_API}`;
    // Un dominio público (el backend desplegado) funciona igual desde el
    // navegador, así que se respeta antes de caer a localhost.
    if (desdeEnv && hostEnv && esRemoto(hostEnv)) {
      return { url: desdeEnv, origen: 'env-remoto' };
    }
    if (
      desdeEnv &&
      (hostEnv === 'localhost' || hostEnv === '127.0.0.1' || (lan && hostEnv === lan))
    ) {
      return { url: desdeEnv, origen: 'env' };
    }
    if (desdeEnv && hostEnv && esIpPrivada(hostEnv)) {
      logWarn('api', `Ignorando EXPO_PUBLIC_API_URL=${desdeEnv} en web; usando ${url}`);
    }
    return { url, origen: 'web-localhost' };
  }

  if (lan) {
    const urlLan = `http://${lan}:${PUERTO_API}`;
    if (desdeEnv && hostEnv && esRemoto(hostEnv)) {
      return { url: desdeEnv, origen: 'env-remoto' };
    }
    if (desdeEnv && hostEnv && hostEnv !== lan) {
      logWarn(
        'api',
        `EXPO_PUBLIC_API_URL (${desdeEnv}) no coincide con la IP de Metro (${lan}). Se usará ${urlLan}`
      );
    }
    return { url: urlLan, origen: 'metro-lan' };
  }

  if (desdeEnv) return { url: desdeEnv, origen: 'env' };

  if (Platform.OS === 'android') {
    return { url: `http://10.0.2.2:${PUERTO_API}`, origen: 'emulador-android' };
  }

  return { url: `http://localhost:${PUERTO_API}`, origen: 'localhost' };
}

const resuelto = resolverApiUrl();

export const API_URL = resuelto.url;

logInfo('api', `API_URL=${API_URL}`, {
  origen: resuelto.origen,
  plataforma: Platform.OS,
  env: process.env.EXPO_PUBLIC_API_URL ?? null,
  metro: hostDesdeMetro(),
});
