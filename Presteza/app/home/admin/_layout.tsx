import { Tabs } from 'expo-router';

import { EnvoltorioAdmin } from '@/features/administracion/components/EnvoltorioAdmin';
import { AdminProvider } from '@/features/administracion/context/AdminContext';

export default function AdminLayout() {
  return (
    <AdminProvider>
      <EnvoltorioAdmin>
        <Tabs
          tabBar={() => null}
          screenOptions={{
            headerShown: false,
            tabBarStyle: { display: 'none', height: 0 },
            sceneStyle: { backgroundColor: 'transparent', flex: 1 },
          }}>
          <Tabs.Screen name="index" options={{ title: 'Resumen' }} />
          <Tabs.Screen name="productos" options={{ title: 'Productos' }} />
          <Tabs.Screen name="pedidos" options={{ title: 'Pedidos' }} />
          <Tabs.Screen name="categorias" options={{ title: 'Categorías' }} />
          <Tabs.Screen name="inventario" options={{ title: 'Inventario' }} />
          <Tabs.Screen name="reservas" options={{ title: 'Reservas' }} />
          <Tabs.Screen name="adicionales" options={{ title: 'Adicionales' }} />
          <Tabs.Screen name="mensajes" options={{ title: 'Mensajes' }} />
          <Tabs.Screen name="clientes" options={{ title: 'Clientes' }} />
          <Tabs.Screen name="ajustes" options={{ title: 'Ajustes' }} />
        </Tabs>
      </EnvoltorioAdmin>
    </AdminProvider>
  );
}
