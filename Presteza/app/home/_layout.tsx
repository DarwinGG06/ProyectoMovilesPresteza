import { Drawer } from 'expo-router/drawer';

import { ContenidoDrawerHome } from '@/features/inicio/components/ContenidoDrawerHome';

export default function HomeLayout() {
  return (
    <Drawer
      drawerContent={(props) => <ContenidoDrawerHome {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        overlayColor: 'rgba(26, 21, 16, 0.55)',
        swipeEnabled: true,
        swipeEdgeWidth: 48,
        drawerStyle: {
          width: '86%',
          backgroundColor: 'transparent',
        },
      }}>
      <Drawer.Screen name="index" options={{ title: 'Inicio', drawerLabel: 'Inicio' }} />
      <Drawer.Screen name="menu" options={{ title: 'Menú', drawerLabel: 'Menú' }} />
      <Drawer.Screen name="sede" options={{ title: 'Nuestra Sede', drawerLabel: 'Nuestra Sede' }} />
      <Drawer.Screen name="nosotros" options={{ title: 'Nosotros', drawerLabel: 'Nosotros' }} />
      <Drawer.Screen name="contacto" options={{ title: 'Contacto', drawerLabel: 'Contacto' }} />
      <Drawer.Screen name="reservas" options={{ title: 'Reservas', drawerLabel: 'Reservas' }} />
      <Drawer.Screen name="administracion" options={{ title: 'Administración', drawerLabel: 'Administración' }} />
    </Drawer>
  );
}
