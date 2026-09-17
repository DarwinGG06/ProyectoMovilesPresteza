/**
 * Endpoints de autenticación (/auth) y usuarios (/users).
 */

import type { Cliente, RegistroDatos, User } from '../types';
import { request } from './client';
import { idDe, lista, seguro, texto } from './helpers';
import { logError, logInfo } from './logger';

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

export function decodificarToken(jwt: string): User {
  const parte = jwt.split('.')[1];
  if (!parte) throw new Error('Token inválido');

  try {
    const payload = JSON.parse(decodificarBase64Url(parte)) as {
      userId?: string;
      email?: string;
      name?: string;
      phone_number?: string;
      role?: string;
    };

    const usuario: User = {
      id: payload.userId ?? '',
      name: payload.name ?? payload.email?.split('@')[0] ?? 'Invitado',
      email: payload.email ?? '',
      phone: payload.phone_number ?? '',
      role: payload.role === 'admin' ? 'admin' : 'client',
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

/** POST /auth/login -> token de sesión y usuario que entró. */
export async function login(email: string, password: string) {
  const normalizado = email.trim().toLowerCase();
  logInfo('auth', 'login()', { email: normalizado });

  try {
    const session = await request<LoginRespuesta>('/auth/login', {
      method: 'POST',
      body: { email: normalizado, password },
    });
    const jwt = extraerJwt(session);
    if (!jwt) {
      throw new Error('El servidor no devolvió un token válido');
    }
    return { token: jwt, user: decodificarToken(jwt) };
  } catch (error) {
    const textoError = error instanceof Error ? error.message : '';
    logError('auth', 'login() falló', { email: normalizado, mensaje: textoError });
    if (/invalid credentials|incorrectos/i.test(textoError)) {
      throw new Error('Correo o contraseña incorrectos');
    }
    throw error;
  }
}

/** POST /auth/register -> el usuario creado. Ojo: NO devuelve token. */
export async function register(name: string, email: string, password: string, phone: string) {
  const payload = {
    complete_name: name.trim(),
    email: email.trim().toLowerCase(),
    phone_number: phone.trim(),
    password,
    role: 'client',
  };

  logInfo('auth', 'register()', {
    email: payload.email,
    complete_name: payload.complete_name,
    phone_number: payload.phone_number,
  });

  try {
    return await request<{ message: string; userId: string }>('/auth/register', {
      method: 'POST',
      body: payload,
    });
  } catch (error) {
    const textoError = error instanceof Error ? error.message : '';
    logError('auth', 'register() falló', { email: payload.email, mensaje: textoError });
    if (/already registered|ya está registrado/i.test(textoError)) {
      throw new Error('Ese correo ya está registrado.');
    }
    throw error;
  }
}

export function forgotPassword(email: string) {
  return request<{ message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: { email: email.trim().toLowerCase() },
  });
}

export function resetPassword(jwt: string, newPassword: string) {
  return request<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    body: { token: jwt, newPassword },
  });
}

export function listarUsuarios(jwt: string) {
  return seguro(async () => {
    const data = await request('/users', { token: jwt });
    const crudos = lista<Record<string, unknown>>(data, 'users');
    return crudos.map((usuario) => ({
      id: idDe({ id: texto(usuario.id), _id: texto(usuario._id) }),
      name: texto(usuario.complete_name) || texto(usuario.name),
      email: texto(usuario.email) || undefined,
      phone: texto(usuario.phone_number) || undefined,
      role: texto(usuario.role) || undefined,
    })) as Cliente[];
  }, [] as Cliente[]);
}

export async function crearCliente(datos: { name: string; email: string; phone: string; password: string }) {
  const respuesta = await request<{ message?: string; userId?: string; user?: { id?: string; _id?: string } }>(
    '/auth/register',
    {
      method: 'POST',
      body: {
        complete_name: datos.name,
        email: datos.email,
        phone_number: datos.phone,
        password: datos.password,
        role: 'client',
      },
    },
  );

  return {
    id: respuesta.userId || idDe(respuesta.user) || datos.email,
    name: datos.name,
    email: datos.email,
    phone: datos.phone,
    role: 'client',
  } satisfies Cliente;
}

export async function actualizarCliente(
  jwt: string,
  id: string,
  datos: { name?: string; email?: string; phone?: string; password?: string },
) {
  const body: Record<string, unknown> = {};
  if (datos.name !== undefined) body.complete_name = datos.name;
  if (datos.email !== undefined) body.email = datos.email;
  if (datos.phone !== undefined) body.phone_number = datos.phone;
  if (datos.password) body.password = datos.password;

  await request(`/users/${id}`, { method: 'PATCH', token: jwt, body });
  return {
    id,
    name: datos.name,
    email: datos.email,
    phone: datos.phone,
  };
}

export function eliminarCliente(jwt: string, id: string) {
  return request<void>(`/users/${id}`, { method: 'DELETE', token: jwt });
}

export type { RegistroDatos };
