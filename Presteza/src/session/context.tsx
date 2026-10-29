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
import { setOnUnauthorized, setToken } from '../api/client';
import { logError, logInfo } from '../api/logger';
import type { User } from '../types';
import { authenticateDevice, getBiometricSupport, type BiometricSupport } from './biometrics';
import { SessionLockScreen } from './SessionLockScreen';
import {
  readBiometricUser,
  readBiometricToken,
  readSessionToken,
  writeBiometricUser,
  writeBiometricAccess,
  writeSessionToken,
} from './storage';

interface Session {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signInWithBiometrics: () => Promise<User>;
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
    label: 'Huella digital',
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
    const inBackground =
      Platform.OS === 'android' && appState.current && appState.current !== 'active';
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
            label: 'Huella digital',
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
        const protectedUser = await readBiometricUser();
        if (!activo || operation !== version.current) return;
        // La preferencia sobrevive al logout, pero no inicia una sesión por sí sola.
        setBiometricEnabledState(Platform.OS === 'android' && Boolean(protectedUser));
        if (!guardado) return;

        let usuario: User;
        try {
          usuario = api.decodificarToken(guardado);
        } catch {
          await writeSessionToken(null);
          logInfo('auth', 'Sesión guardada vencida o inválida; se requiere iniciar sesión');
          return;
        }

        const protect = Platform.OS === 'android' && protectedUser === usuario.id;
        if (protect && !(await readBiometricToken())) {
          // Migra instalaciones que solo guardaban el token de la sesión activa.
          await writeBiometricAccess(usuario.id, guardado);
          if (!activo || operation !== version.current) return;
        }
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
    if (Platform.OS !== 'android') return;
    const subscription = AppState.addEventListener('change', (next) => {
      appState.current = next;
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
  const salir = () => {
    const session = savedSession.current;
    const preserveBiometric = Platform.OS === 'android' && enabledRef.current && Boolean(session);
    version.current++;
    savedSession.current = null;
    setSessionEmail('');
    enabledRef.current = false;
    setLocked(false);
    setBiometricError(null);
    if (preserveBiometric) setBiometricEnabledState(true);
    logInfo('auth', 'logout', { email: session?.user.email ?? user?.email ?? null });
    setToken(null);
    setTokenState(null);
    setUser(null);
    const persist = async () => {
      if (preserveBiometric && session) {
        try {
          api.decodificarToken(session.token);
          await writeBiometricAccess(session.user.id, session.token);
        } catch (error) {
          const message = error instanceof Error ? error.message : '';
          const unusable = /expirado|inválido|usuario válido/i.test(message);
          if (!unusable) {
            logError('auth', 'No se pudo actualizar la credencial biométrica', {
              error: message || error,
            });
          }
        }
      }
      await writeSessionToken(null);
    };
    void persist().catch((error: unknown) => {
      logError('auth', 'No se pudo borrar la sesión guardada', {
        error: error instanceof Error ? error.message : error,
      });
    });
  };

  const signIn = async (email: string, password: string) => {
    if (!email.trim() || !password.trim()) {
      throw new Error('Por favor completa todos los campos');
    }

    const operation = ++version.current;
    logInfo('auth', 'login iniciado', { email: email.trim().toLowerCase() });
    const session = await api.login(email, password);
    const protectedUser = await readBiometricUser();
    if (!mounted.current || operation !== version.current) {
      throw new Error('La sesión cambió. Inténtalo de nuevo.');
    }
    if (protectedUser && protectedUser !== session.user.id) await writeBiometricUser(null);
    if (!mounted.current || operation !== version.current) {
      throw new Error('La sesión cambió. Inténtalo de nuevo.');
    }
    if (Platform.OS === 'android' && protectedUser === session.user.id) {
      await writeBiometricAccess(session.user.id, session.token);
      if (!mounted.current || operation !== version.current) {
        throw new Error('La sesión cambió. Inténtalo de nuevo.');
      }
    }
    await writeSessionToken(session.token);
    if (!mounted.current || operation !== version.current) {
      throw new Error('La sesión cambió. Inténtalo de nuevo.');
    }
    publishSession(session, Platform.OS === 'android' && protectedUser === session.user.id);
    logInfo('auth', 'login OK', {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
    });
    return session.user;
  };

  const signInWithBiometrics = async () => {
    if (Platform.OS !== 'android') throw new Error('Este acceso está disponible solo en Android.');
    if (busyRef.current) throw new Error('Ya hay una verificación en curso.');
    const operation = version.current;
    busyRef.current = true;
    setBiometricBusy(true);
    setBiometricError(null);
    try {
      const protectedUser = await readBiometricUser();
      const rememberedToken = await readBiometricToken();
      if (!mounted.current || operation !== version.current) {
        throw new Error('La sesión cambió durante la verificación. Inténtalo de nuevo.');
      }
      if (!protectedUser) {
        throw new Error(
          'Primero ingresa con tu correo y contraseña y activa el acceso biométrico en Ajustes.'
        );
      }
      if (!rememberedToken) {
        throw new Error(
          'El acceso biométrico está activado, pero falta la sesión guardada. Ingresa con tu contraseña para recuperarla.'
        );
      }
      const decodeRemembered = () => {
        try {
          return api.decodificarToken(rememberedToken);
        } catch {
          throw new Error(
            'El acceso biométrico sigue activado, pero la sesión ha expirado o ya no es válida. Ingresa con tu contraseña para renovarla.'
          );
        }
      };
      const rememberedUser = decodeRemembered();
      if (rememberedUser.id !== protectedUser) {
        throw new Error(
          'La cuenta guardada no coincide con la activación biométrica. Ingresa con tu contraseña.'
        );
      }
      const session = { user: rememberedUser, token: rememberedToken };
      await authenticateDevice();
      if (!mounted.current || operation !== version.current) {
        throw new Error('La sesión cambió durante la verificación. Inténtalo de nuevo.');
      }
      decodeRemembered();
      await writeSessionToken(session.token);
      if (!mounted.current || operation !== version.current) {
        throw new Error('La sesión cambió durante la verificación. Inténtalo de nuevo.');
      }
      publishSession(session, true);
      return session.user;
    } catch (error) {
      if (mounted.current && operation === version.current) {
        setBiometricError(
          error instanceof Error ? error.message : 'No se pudo desbloquear. Usa tu contraseña.'
        );
      }
      throw error;
    } finally {
      busyRef.current = false;
      if (mounted.current) setBiometricBusy(false);
    }
  };

  const unlock = async () => {
    try {
      await signInWithBiometrics();
    } catch {}
  };

  const setBiometricEnabled = async (enabled: boolean) => {
    if (Platform.OS !== 'android') throw new Error('Este acceso está disponible solo en Android.');
    if (busyRef.current) throw new Error('Ya hay una verificación en curso.');
    if (locked || !savedSession.current)
      throw new Error('Inicia sesión antes de cambiar el acceso biométrico.');
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
      if (!mounted.current || operation !== version.current)
        throw new Error('La sesión cambió. No se pudo guardar el ajuste.');
      if (enabled) await writeBiometricAccess(session.user.id, session.token);
      else await writeBiometricUser(null);
      if (!mounted.current || operation !== version.current)
        throw new Error('La sesión cambió. Vuelve a comprobar el ajuste.');
      publishSession(session, enabled);
    } finally {
      busyRef.current = false;
      if (mounted.current) {
        setBiometricBusy(false);
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
        signInWithBiometrics,
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
        <View className="flex-1 items-center justify-center bg-pergamino">
          <ActivityIndicator color="#3a0c20" />
          <Text className="mt-3 text-marca-oscura">Cargando sesión...</Text>
        </View>
      ) : locked ? (
        <SessionLockScreen
          email={sessionEmail}
          busy={biometricBusy}
          error={biometricError}
          onUnlock={unlock}
          onPassword={async (password) => {
            await signIn(sessionEmail, password);
          }}
          onSignOut={salir}
        />
      ) : (
        children
      )}
    </SessionContext.Provider>
  );
}
