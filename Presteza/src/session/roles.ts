export function esAdmin(user?: { role?: string } | null) {
  return user?.role === 'admin';
}

export function esRepartidor(user?: { role?: string } | null) {
  return user?.role === 'repartidor';
}

export function rutaTrasSesion(user?: { role?: string } | null) {
  if (esAdmin(user)) return '/home/admin';
  if (esRepartidor(user)) return '/home/repartidor';
  return '/perfil';
}
