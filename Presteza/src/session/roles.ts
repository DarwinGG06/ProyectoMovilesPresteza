export function esAdmin(user?: { role?: string } | null) {
  return user?.role === 'admin';
}

export function rutaTrasSesion(user?: { role?: string } | null) {
  return esAdmin(user) ? '/home/admin' : '/perfil';
}
