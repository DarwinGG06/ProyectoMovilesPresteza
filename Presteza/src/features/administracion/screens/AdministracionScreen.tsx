import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { useAuth } from '@/auth/AuthContext';
import { InvitadoPerfil } from '@/features/perfil/components/InvitadoPerfil';
import { Footer } from '@/shared/components/footer';
import { SelloP } from '@/shared/components/nav-bar/SelloP';

import { HeroAdmin } from '@/features/administracion/components/HeroAdmin';
import { PestanasAdmin } from '@/features/administracion/components/PestanasAdmin';
import { TabAdicionales } from '@/features/administracion/components/tabs/TabAdicionales';
import { TabAjustes } from '@/features/administracion/components/tabs/TabAjustes';
import { TabCategorias } from '@/features/administracion/components/tabs/TabCategorias';
import { TabClientes } from '@/features/administracion/components/tabs/TabClientes';
import { TabDashboard } from '@/features/administracion/components/tabs/TabDashboard';
import { TabInventario } from '@/features/administracion/components/tabs/TabInventario';
import { TabMensajes } from '@/features/administracion/components/tabs/TabMensajes';
import { TabPedidos } from '@/features/administracion/components/tabs/TabPedidos';
import { TabProductos } from '@/features/administracion/components/tabs/TabProductos';
import { TabReservas } from '@/features/administracion/components/tabs/TabReservas';
import { useAdmin } from '@/features/administracion/hooks/useAdmin';
import type { PestanaAdmin } from '@/features/administracion/types';

export function AdministracionScreen() {
  const { isAuthenticated, user } = useAuth();
  const admin = useAdmin();
  const [pestana, setPestana] = useState<PestanaAdmin>('dashboard');

  useEffect(() => {
    if (isAuthenticated && user && user.role !== 'admin') {
      router.replace('/perfil');
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated || !user) {
    return <InvitadoPerfil />;
  }

  if (user.role !== 'admin') {
    return (
      <View className="flex-1 items-center justify-center bg-marca-oscura">
        <ActivityIndicator color="#d4af77" />
      </View>
    );
  }

  if (admin.cargando && !admin.pedidos.length && !admin.productos.length) {
    return (
      <View className="flex-1 items-center justify-center bg-marca-oscura">
        <SelloP size="lg" />
        <View className="mt-6">
          <ActivityIndicator color="#d4af77" />
        </View>
        <Text className="mt-3 text-sm text-crema/70">Abriendo la casa...</Text>
      </View>
    );
  }

  if (!admin.token) {
    return <InvitadoPerfil />;
  }

  return (
    <View className="flex-1 bg-marca-oscura">
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <HeroAdmin nombre={user.name} stats={admin.stats} />
        <PestanasAdmin
          activa={pestana}
          onChange={setPestana}
          contadores={{
            pedidos: admin.stats.pendingOrders,
            categorias: admin.stats.totalCategorias,
            inventario: admin.stats.totalInsumos,
            adicionales: admin.stats.totalAdicionales,
            clientes: admin.stats.totalCustomers,
          }}
        />

        <View className="px-5 pb-10 pt-6">
          {admin.error ? <Text className="mb-4 text-sm text-red-300">{admin.error}</Text> : null}

          {pestana === 'dashboard' ? (
            <TabDashboard stats={admin.stats} pedidos={admin.pedidos} onIr={setPestana} />
          ) : null}
          {pestana === 'productos' ? (
            <TabProductos
              productos={admin.productos}
              categorias={admin.categorias}
              guardando={admin.guardando}
              onGuardar={admin.guardarProducto}
              onAlternar={admin.alternarProducto}
              onEliminar={admin.eliminarProducto}
            />
          ) : null}
          {pestana === 'pedidos' ? (
            <TabPedidos
              pedidos={admin.pedidos}
              clientes={admin.clientes}
              productos={admin.productos}
              guardando={admin.guardando}
              onGuardar={admin.guardarPedido}
              onCambiarEstado={admin.cambiarEstadoPedido}
              onEliminar={admin.eliminarPedido}
            />
          ) : null}
          {pestana === 'categorias' ? (
            <TabCategorias
              categorias={admin.categorias}
              guardando={admin.guardando}
              onGuardar={admin.guardarCategoria}
              onEliminar={admin.eliminarCategoria}
            />
          ) : null}
          {pestana === 'inventario' ? (
            <TabInventario
              insumos={admin.insumos}
              guardando={admin.guardando}
              onGuardar={admin.guardarInsumo}
              onEliminar={admin.eliminarInsumo}
            />
          ) : null}
          {pestana === 'reservas' ? <TabReservas reservas={admin.casaReservas} /> : null}
          {pestana === 'adicionales' ? (
            <TabAdicionales
              adicionales={admin.adicionales}
              guardando={admin.guardando}
              onGuardar={admin.guardarAdicional}
              onAlternar={admin.alternarAdicional}
              onEliminar={admin.eliminarAdicional}
            />
          ) : null}
          {pestana === 'mensajes' ? (
            <TabMensajes
              mensajes={admin.mensajes}
              guardando={admin.guardando}
              onGuardar={admin.guardarMensaje}
              onEliminar={admin.eliminarMensaje}
            />
          ) : null}
          {pestana === 'clientes' ? (
            <TabClientes
              clientes={admin.clientes}
              guardando={admin.guardando}
              onGuardar={admin.guardarCliente}
              onEliminar={admin.eliminarCliente}
            />
          ) : null}
          {pestana === 'ajustes' ? (
            <TabAjustes user={user} guardando={admin.guardando} onGuardar={admin.guardarAjustes} onSalir={admin.salir} />
          ) : null}
        </View>
        <Footer />
      </ScrollView>
    </View>
  );
}
