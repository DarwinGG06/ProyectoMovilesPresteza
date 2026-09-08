import { Pressable, Text, View } from 'react-native';

import { useAuth } from '@/auth/AuthContext';
import { ContenedorPantalla } from '@/shared/components/contenedor-pantalla/ContenedorPantalla';

export function PerfilScreen() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <ContenedorPantalla titulo="Perfil">
        <Text className="mt-4 text-base text-texto/70">Inicia sesión para ver tu perfil.</Text>
      </ContenedorPantalla>
    );
  }

  return (
    <ContenedorPantalla titulo="Perfil">
      <View className="mt-8 border border-oro/30 bg-white px-5 py-5">
        <Text className="text-[10px] tracking-[3px] text-marca">CUENTA</Text>
        <Text className="mt-2 text-2xl font-light text-marca-oscura">{user.name}</Text>
        <Text className="mt-2 text-base text-texto/70">{user.email}</Text>
        {user.phone ? <Text className="mt-1 text-base text-texto/70">{user.phone}</Text> : null}
        <Text className="mt-3 text-sm text-marca">{user.role === 'admin' ? 'Administrador' : 'Cliente'}</Text>
      </View>

      <Pressable onPress={logout} className="mt-8 border border-marca-oscura py-4">
        <Text className="text-center text-[11px] tracking-[3px] text-marca-oscura">CERRAR SESIÓN</Text>
      </Pressable>
    </ContenedorPantalla>
  );
}
