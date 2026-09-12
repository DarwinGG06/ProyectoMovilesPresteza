import { pedirApi } from '@/services/api/cliente';
import { logError, logInfo } from '@/services/api/logger';

export type RegistroDatos = {
  complete_name: string;
  email: string;
  phone_number: string;
  password: string;
};

type LoginRespuesta = {
  message?: string;
  user?: string;
  token?: string;
  access_token?: string;
};

function decodificarBase64Url(valor: string) {
  const base64 = valor.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');

  if (typeof globalThis.atob !== 'function') {
    throw new Error('Este dispositivo no puede leer el token de sesión');
  }

  const binario = globalThis.atob(padded);
  try {
    return decodeURIComponent(
      Array.from(binario, (caracter) => `%${caracter.charCodeAt(0).toString(16).padStart(2, '0')}`).join(''),
    );
  } catch {
    return binario;
  }
}

export function extraerJwt(respuesta: LoginRespuesta) {
  const candidato = respuesta.user ?? respuesta.token ?? respuesta.access_token;
  return typeof candidato === 'string' && candidato.length > 0 ? candidato : null;
}

export function decodificarToken(token: string) {
  const parte = token.split('.')[1];
  if (!parte) throw new Error('Token inválido');

  try {
    const payload = JSON.parse(decodificarBase64Url(parte)) as {
      userId?: string;
      email?: string;
      name?: string;
      phone_number?: string;
      role?: string;
    };

    const usuario = {
      id: payload.userId ?? '',
      name: payload.name ?? payload.email?.split('@')[0] ?? 'Invitado',
      email: payload.email ?? '',
      phone: payload.phone_number ?? '',
      role: payload.role === 'admin' ? ('admin' as const) : ('client' as const),
    };

    logInfo('auth', 'token decodificado', {
      id: usuario.id,
      email: usuario.email,
      role: usuario.role,
    });

    return usuario;
  } catch (error) {
    logError('auth', 'no se pudo decodificar el JWT', {
      error: error instanceof Error ? error.message : error,
    });
    throw new Error('El servidor devolvió un token inválido');
  }
}

export function loginApi(email: string, password: string) {
  const normalizado = email.trim().toLowerCase();
  logInfo('auth', 'loginApi()', { email: normalizado });

  return pedirApi<LoginRespuesta>('/auth/login', {
    method: 'POST',
    body: { email: normalizado, password },
  }).catch((error) => {
    const texto = error instanceof Error ? error.message : '';
    logError('auth', 'loginApi() falló', { email: normalizado, mensaje: texto });
    if (/invalid credentials|incorrectos/i.test(texto)) {
      throw new Error('Correo o contraseña incorrectos');
    }
    throw error;
  });
}

export function registerApi(datos: RegistroDatos) {
  const payload = {
    complete_name: datos.complete_name.trim(),
    email: datos.email.trim().toLowerCase(),
    phone_number: datos.phone_number.trim(),
    password: datos.password,
    role: 'client',
  };

  logInfo('auth', 'registerApi()', {
    email: payload.email,
    complete_name: payload.complete_name,
    phone_number: payload.phone_number,
  });

  return pedirApi<{ message: string; userId: string }>('/auth/register', {
    method: 'POST',
    body: payload,
  }).catch((error) => {
    const texto = error instanceof Error ? error.message : '';
    logError('auth', 'registerApi() falló', { email: payload.email, mensaje: texto });
    if (/already registered|ya está registrado/i.test(texto)) {
      throw new Error('Ese correo ya está registrado.');
    }
    throw error;
  });
}

export function forgotPasswordApi(email: string) {
  return pedirApi<{ message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: { email: email.trim().toLowerCase() },
  });
}

export function resetPasswordApi(token: string, newPassword: string) {
  return pedirApi<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    body: { token, newPassword },
  });
}
