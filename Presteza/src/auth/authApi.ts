import { pedirApi } from '@/services/api/cliente';

export type RegistroDatos = {
  complete_name: string;
  email: string;
  phone_number: string;
  password: string;
};

type LoginRespuesta = {
  message: string;
  user: string;
};

export function decodificarToken(token: string) {
  const parte = token.split('.')[1];
  if (!parte) throw new Error('Token inválido');

  const base64 = parte.replace(/-/g, '+').replace(/_/g, '/');
  const json = globalThis.atob(base64);
  const payload = JSON.parse(json) as {
    userId?: string;
    email?: string;
    name?: string;
    phone_number?: string;
    role?: string;
  };

  return {
    id: payload.userId ?? '',
    name: payload.name ?? payload.email?.split('@')[0] ?? 'Invitado',
    email: payload.email ?? '',
    phone: payload.phone_number ?? '',
    role: payload.role === 'admin' ? ('admin' as const) : ('client' as const),
  };
}

export function loginApi(email: string, password: string) {
  return pedirApi<LoginRespuesta>('/auth/login', {
    method: 'POST',
    body: { email: email.trim().toLowerCase(), password },
  });
}

export function registerApi(datos: RegistroDatos) {
  return pedirApi<{ message: string; userId: string }>('/auth/register', {
    method: 'POST',
    body: {
      complete_name: datos.complete_name.trim(),
      email: datos.email.trim().toLowerCase(),
      phone_number: datos.phone_number.trim(),
      password: datos.password,
      role: 'client',
    },
  }).catch((error) => {
    const texto = error instanceof Error ? error.message : '';
    if (texto.toLowerCase().includes('already registered')) {
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
