import { Stack } from 'expo-router';

import { EnvoltorioAdmin } from '@/features/administracion/components/EnvoltorioAdmin';
import { MarcoAdmin } from '@/features/administracion/components/MarcoAdmin';
import { AdminProvider } from '@/features/administracion/context/AdminContext';

export default function AdminLayout() {
  return (
    <AdminProvider>
      <EnvoltorioAdmin>
        <MarcoAdmin>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'fade',
              contentStyle: { backgroundColor: 'transparent' },
            }}>
            <Stack.Screen name="index" options={{ title: 'Resumen' }} />
            <Stack.Screen name="productos" options={{ title: 'Productos' }} />
            <Stack.Screen name="pedidos" options={{ title: 'Pedidos' }} />
            <Stack.Screen name="categorias" options={{ title: 'Categorías' }} />
            <Stack.Screen name="inventario" options={{ title: 'Inventario' }} />
            <Stack.Screen name="reservas" options={{ title: 'Reservas' }} />
            <Stack.Screen name="adicionales" options={{ title: 'Adicionales' }} />
            <Stack.Screen name="mensajes" options={{ title: 'Mensajes' }} />
            <Stack.Screen name="clientes" options={{ title: 'Clientes' }} />
            <Stack.Screen name="ajustes" options={{ title: 'Ajustes' }} />
          </Stack>
        </MarcoAdmin>
      </EnvoltorioAdmin>
    </AdminProvider>
  );
}
