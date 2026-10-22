/**
 * Contexto de sesión: quién está dentro de la app en este momento.
 *
 * Un "contexto" de React es un valor que se comparte con todas las pantallas
 * sin tener que pasarlo de una a otra por props. Aquí guardamos el usuario y
 * exponemos las tres acciones que lo cambian: entrar, registrarse y salir.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { ActivityIndicator, AppState, Platform, Text, View } from 'react-native';

import * as api from '../api/auth';
import { setToken } from '../api/client';
import { logError, logInfo } from '../api/logger';
import type { User } from '../types';
import { authenticateDevice, getBiometricSupport, type BiometricSupport } from './biometrics';
import { SessionLockScreen } from './SessionLockScreen';
import {
  readBiometricUser,
  readSessionToken,
  writeBiometricUser,
  writeSessionToken,
} from './storage';

interface Session {
  /** null = nadie ha entrado. */
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    name: string,
    email: string,
    password: string,
    phone: string,
    birthDate: string
  ) => Promise<void>;
  signOut: () => void;
  logout: () => void;
  actualizarUsuario: (parcial: Partial<User>) => void;
  biometricEnabled: boolean;
  biometricSupport: BiometricSupport;
  biometricBusy: boolean;
  setBiometricEnabled: (enabled: boolean) => Promise<void>;
}

const SessionContext = createContext<Session | null>(null);

/** Atajo para leer la sesión desde cualquier pantalla: `const { user } = useSession()`. */
export function useSession(): Session {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession debe usarse dentro de <SessionProvider />');
  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [restaurando, setRestaurando] = useState(true);
  const [locked, setLocked] = useState(false);
  const [sessionEmail, setSessionEmail] = useState('');
  const [biometricEnabled, setBiometricEnabledState] = useState(false);
  const [biometricBusy, setBiometricBusy] = useState(false);
  const [biometricError, setBiometricError] = useState<string | null>(null);
  const [biometricSupport, setBiometricSupport] = useState<BiometricSupport>({
    available: false,
    label: 'Huella o rostro',
    reason: 'Comprobando la biometría del dispositivo...',
  });
  // Una sesión bloqueada no se publica en el contexto ni en el cliente HTTP.
  const savedSession = useRef<{ user: User; token: string } | null>(null);
  const enabledRef = useRef(false);
  const busyRef = useRef(false);
  const version = useRef(0);
  const mounted = useRef(true);
  const appState = useRef(AppState.currentState);

  const publishSession = (session: { user: User; token: string }, protect: boolean) => {
    savedSession.current = session;
    setSessionEmail(session.user.email);
    enabledRef.current = protect;
    setBiometricEnabledState(protect);
    const inBackground = Platform.OS !== 'web' && appState.current && appState.current !== 'active';
    setLocked(Boolean(protect && inBackground));
    setToken(protect && inBackground ? null : session.token);
    setTokenState(protect && inBackground ? null : session.token);
    setUser(protect && inBackground ? null : session.user);
    setBiometricError(null);
  };

  useEffect(() => {
    mounted.current = true;
    version.current++;
    void getBiometricSupport()
      .then((support) => {
        if (mounted.current) setBiometricSupport(support);
      })
      .catch(() => {
        if (mounted.current)
          setBiometricSupport({
            available: false,
            label: 'Huella o rostro',
            reason: 'No se pudo consultar la biometría. Comprueba los ajustes del teléfono.',
          });
      });
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    let activo = true;
    const operation = version.current;

    const restaurar = async () => {
      try {
        const guardado = await readSessionToken();
        if (!activo || !guardado) return;

        let usuario: User;
        try {
          usuario = api.decodificarToken(guardado);
        } catch {
          await writeSessionToken(null);
          logInfo('auth', 'Sesión guardada vencida o inválida; se requiere iniciar sesión');
          return;
        }

        const protectedUser = await readBiometricUser();
        if (!activo || operation !== version.current) return;
        const protect = Platform.OS !== 'web' && protectedUser === usuario.id;
        savedSession.current = { user: usuario, token: guardado };
        setSessionEmail(usuario.email);
        enabledRef.current = protect;
        setBiometricEnabledState(protect);
        if (protect) {
          setToken(null);
          setLocked(true);
        } else {
          setToken(guardado);
          setTokenState(guardado);
          setUser(usuario);
        }
      } catch (error) {
        logError('auth', 'No se pudo restaurar la sesión', {
          error: error instanceof Error ? error.message : error,
        });
      } finally {
        if (activo) setRestaurando(false);
      }
    };

    void restaurar();
    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    const subscription = AppState.addEventListener('change', (next) => {
      appState.current = next;
      // El diálogo nativo también puede volver inactiva la app. No bloquearlo en bucle.
      if (next === 'active' || busyRef.current || !enabledRef.current || !savedSession.current)
        return;
      setToken(null);
      setTokenState(null);
      setUser(null);
      setBiometricError(null);
      setLocked(true);
    });
    return () => subscription.remove();
  }, []);

  const actualizarUsuario = useCallback((parcial: Partial<User>) => {
    if (parcial.email !== undefined) setSessionEmail(parcial.email);
    if (savedSession.current) {
      savedSession.current = {
        ...savedSession.current,
        user: { ...savedSession.current.user, ...parcial },
      };
    }
    setUser((prev) => (prev ? { ...prev, ...parcial } : prev));
  }, []);

  /**
   * Pide el token al backend y lo deja disponible para las siguientes
   * peticiones. Si las credenciales son malas, `api.login` lanza el error del
   * servidor y la pantalla de login lo muestra: aquí no se atrapa.
   */
  const salir = () => {
    version.current++;
    savedSession.current = null;
    setSessionEmail('');
    enabledRef.current = false;
    setLocked(false);
    setBiometricEnabledState(false);
    setBiometricError(null);
    logInfo('auth', 'logout', { email: user?.email ?? null });
    setToken(null);
    setTokenState(null);
    setUser(null);
    void Promise.all([writeSessionToken(null), writeBiometricUser(null)]).catch(
      (error: unknown) => {
        logError('auth', 'No se pudo borrar la sesión guardada', {
          error: error instanceof Error ? error.message : error,
        });
      }
    );
  };

  const signIn = async (email: string, password: string) => {
    if (!email.trim() || !password.trim()) {
      throw new Error('Por favor completa todos los campos');
    }

    const operation = ++version.current;
    logInfo('auth', 'login iniciado', { email: email.trim().toLowerCase() });
    const session = await api.login(email, password);
    const protectedUser = await readBiometricUser();
    if (!mounted.current || operation !== version.current) return;
    if (protectedUser && protectedUser !== session.user.id) await writeBiometricUser(null);
    if (!mounted.current || operation !== version.current) return;
    await writeSessionToken(session.token);
    if (!mounted.current || operation !== version.current) return;
    publishSession(session, Platform.OS !== 'web' && protectedUser === session.user.id);
    logInfo('auth', 'login OK', {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
    });
  };

  const unlock = async () => {
    if (busyRef.current || !savedSession.current) return;
    const operation = version.current;
    const session = savedSession.current;
    busyRef.current = true;
    setBiometricBusy(true);
    setBiometricError(null);
    try {
      // La huella no renueva ni prolonga el JWT emitido por el servidor.
      api.decodificarToken(session.token);
      await authenticateDevice();
      if (!mounted.current || operation !== version.current) return;
      api.decodificarToken(session.token);
      publishSession(session, true);
    } catch (error) {
      if (mounted.current && operation === version.current) {
        setBiometricError(
          error instanceof Error ? error.message : 'No se pudo desbloquear. Usa tu contraseña.'
        );
      }
    } finally {
      busyRef.current = false;
      if (mounted.current) setBiometricBusy(false);
    }
  };

  const setBiometricEnabled = async (enabled: boolean) => {
    if (busyRef.current || locked || !savedSession.current) return;
    const session = savedSession.current;
    const operation = version.current;
    busyRef.current = true;
    setBiometricBusy(true);
    try {
      if (enabled) {
        const support = await getBiometricSupport();
        setBiometricSupport(support);
        if (!support.available) throw new Error(support.reason);
      }
      await authenticateDevice(
        enabled ? 'Activar desbloqueo de Presteza' : 'Desactivar desbloqueo de Presteza'
      );
      if (!mounted.current || operation !== version.current) return;
      await writeBiometricUser(enabled ? session.user.id : null);
      if (!mounted.current || operation !== version.current) return;
      publishSession(session, enabled);
    } finally {
      busyRef.current = false;
      if (mounted.current) {
        setBiometricBusy(false);
        // Si se abandonó la app durante un intento fallido, conservar el bloqueo.
        if (enabledRef.current && savedSession.current && appState.current !== 'active') {
          setToken(null);
          setTokenState(null);
          setUser(null);
          setLocked(true);
        }
      }
    }
  };

  return (
    <SessionContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        signIn,
        // El registro NO devuelve token, así que enseguida iniciamos sesión.
        signUp: async (name, email, password, phone, birthDate) => {
          logInfo('auth', 'registro iniciado', { email: email.trim().toLowerCase() });
          try {
            await api.register(name, email, password, phone, birthDate);
          } catch (error) {
            logError('auth', 'registro falló', {
              error: error instanceof Error ? error.message : error,
            });
            throw error;
          }
          await signIn(email, password);
        },
        signOut: salir,
        logout: salir,
        actualizarUsuario,
        biometricEnabled,
        biometricSupport,
        biometricBusy,
        setBiometricEnabled,
      }}>
      {restaurando ? (
        <View className="flex-1 items-center justify-center bg-crema">
          <ActivityIndicator color="#3a0c20" />
          <Text className="mt-3 text-marca-oscura">Cargando sesión...</Text>
        </View>
      ) : locked ? (
        <SessionLockScreen
          email={sessionEmail}
          label={biometricSupport.label}
          busy={biometricBusy}
          error={biometricError}
          onUnlock={unlock}
          onPassword={(password) => signIn(sessionEmail, password)}
          onSignOut={salir}
        />
      ) : (
        children
      )}
    </SessionContext.Provider>
  );
}
