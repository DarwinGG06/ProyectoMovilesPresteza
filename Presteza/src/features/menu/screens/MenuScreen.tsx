// src/features/menu/screens/MenuScreen.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TextInput, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
// Asumiendo que usas Ionicons, ajústalo a tu librería de iconos
import { Ionicons } from '@expo/vector-icons'; 

import { Footer } from '@/shared/components/footer';
import { SelloP } from '@/shared/components/nav-bar/SelloP';
import { useMenuPublico } from '../hooks/useMenuPublico';
// IMPORTA EL NUEVO COMPONENTE
import { ModelViewerModal } from '@/features/menu/components/ModelViewerModal'; 

export function MenuScreen() {
  const { productos, categorias, cargando, error } = useMenuPublico();
  
  // Estados para búsqueda y filtrado
  const [busqueda, setBusqueda] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);

  // --- NUEVOS ESTADOS PARA EL MODAL 3D ---
  const [modal3dVisible, setModal3dVisible] = useState(false);
  const [currentModelUrl, setCurrentModelUrl] = useState<string | null>(null);
  const [currentProductName, setCurrentProductName] = useState<string | null>(null);

  // URL TEMPORAL QUEMADA PARA PRUEBAS (Un pastel de glTF de ejemplo de Khronos)
  const URL_3D_TEST = "https://modelviewer.dev/shared-assets/models/Astronaut.glb";

  // Lógica de filtrado en tiempo real
  const productosFiltrados = useMemo(() => {
    return productos.filter((producto) => {
      const coincideBusqueda = 
        producto.name.toLowerCase().includes(busqueda.toLowerCase()) || 
        (producto.description && producto.description.trim().toLowerCase().includes(busqueda.toLowerCase()));
      
      const coincideCategoria = categoriaActiva ? producto.categoryId === categoriaActiva : true;
      
      return coincideBusqueda && coincideCategoria;
    });
  }, [productos, busqueda, categoriaActiva]);

  // --- FUNCIÓN PARA ABRIR EL VISOR 3D ---
  const abrirVisor3d = (productoName: string, backendModelUrl?: string) => {
    // Priorizamos la URL del backend si existe, sino usamos la quemada temporal
    const urlToOpen = backendModelUrl || URL_3D_TEST;
    setCurrentModelUrl(urlToOpen);
    setCurrentProductName(productoName);
    setModal3dVisible(true);
  };

  const cerrarVisor3d = () => {
    setModal3dVisible(false);
    // Limpiamos los datos después de un pequeño delay para que la animación de cierre sea suave
    setTimeout(() => {
        setCurrentModelUrl(null);
        setCurrentProductName(null);
    }, 300);
  };

  // Pantalla de carga (Mismo estilo que tu admin)
  if (cargando && productos.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-marca-oscura">
        <SelloP size="lg" />
        <View className="mt-6">
          <ActivityIndicator color="#d4af77" />
        </View>
        <Text className="mt-3 text-sm text-crema/70">Preparando el menú...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-marca-oscura">
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        
        {/* Cabecera / Hero simple para el cliente */}
        <View className="px-5 pt-10 pb-6 items-center">
          <SelloP size="md" />
          <Text className="text-3xl font-bold text-[#d4af77] mt-4">Nuestro Menú</Text>
          <Text className="text-crema/70 text-center mt-2">
            Descubre nuestros deliciosos platos y acompañantes.
          </Text>
        </View>

        <View className="px-5 pb-10">
          {error && <Text className="mb-4 text-sm text-red-300 text-center">{error}</Text>}

          {/* Buscador */}
          <View className="mb-6">
            <TextInput
              className="bg-black/30 text-crema rounded-lg px-4 py-3 border border-[#d4af77]/30"
              placeholder="Buscar un plato, ingrediente..."
              placeholderTextColor="rgba(212, 175, 119, 0.5)" // Color crema/dorado opaco
              value={busqueda}
              onChangeText={setBusqueda}
            />
          </View>

          {/* Filtro de Categorías (Scroll Horizontal) */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            className="mb-6"
            contentContainerStyle={{ gap: 10 }}
          >
            <TouchableOpacity
              onPress={() => setCategoriaActiva(null)}
              className={`px-4 py-2 rounded-full border ${
                categoriaActiva === null 
                  ? 'bg-[#d4af77] border-[#d4af77]' 
                  : 'bg-transparent border-[#d4af77]/50'
              }`}
            >
              <Text className={categoriaActiva === null ? 'text-black font-bold' : 'text-[#d4af77]'}>
                Todos
              </Text>
            </TouchableOpacity>

            {categorias.map((cat) => (
              <TouchableOpacity
                key={cat.id || cat._id}
                onPress={() => setCategoriaActiva(cat.id || cat._id)}
                className={`px-4 py-2 rounded-full border ${
                  categoriaActiva === (cat.id || cat._id) 
                    ? 'bg-[#d4af77] border-[#d4af77]' 
                    : 'bg-transparent border-[#d4af77]/50'
                }`}
              >
                <Text className={categoriaActiva === (cat.id || cat._id) ? 'text-black font-bold' : 'text-[#d4af77]'}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Lista de Productos Filtrados */}
          {productosFiltrados.length === 0 ? (
            <View className="py-10 items-center">
              <Text className="text-crema/70">No encontramos productos que coincidan.</Text>
            </View>
          ) : (
            <View className="flex-col gap-4">
              {productosFiltrados.map((producto) => (
                <View 
                  key={producto.id || producto._id} 
                  className="flex-row bg-black/20 rounded-xl p-4 border border-white/5 items-center"
                >
                  {/* --- CONTENEDOR DE LA IMAGEN (IMPORTANTE EL RELATIVE) --- */}
                  <View className="relative w-24 h-24 mr-4">
                    {producto.imageUrl ? (
                      <Image 
                        source={{ uri: producto.imageUrl }} 
                        className="w-full h-full rounded-lg bg-black/50"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-full h-full rounded-lg bg-black/50 items-center justify-center">
                        <SelloP size="sm" />
                      </View>
                    )}

                    {/* --- BOTÓN ICONO 3D (POSICIONADO ABSOLUTO) --- */}
                    {/* Supongamos que en tu BD el campo se llama 'modelUrl' */}
                    <TouchableOpacity 
                        className="absolute bottom-1 right-1 bg-black/70 p-1.5 rounded-full border border-[#d4af77]/50"
                        onPress={() => abrirVisor3d(producto.name, producto.modelUrl)}
                    >
                        {/* Un icono que sugiera 3D o cubo */}
                        <Ionicons name="cube-outline" size={16} color="#d4af77" />
                    </TouchableOpacity>
                  </View>

                  {/* Info del producto */}
                  <View className="flex-1 justify-center">
                    <Text className="text-lg font-bold text-crema mb-1">{producto.name}</Text>
                    {producto.description && (
                      <Text className="text-sm text-crema/60 mb-2" numberOfLines={2}>
                        {producto.description}
                      </Text>
                    )}
                    <Text className="text-[#d4af77] font-bold text-base">
                      ${producto.price.toLocaleString('es-CO')}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

        </View>
        <Footer />
      </ScrollView>

      {/* --- RENDERIZA EL MODAL AL FINAL --- */}
      <ModelViewerModal 
        isVisible={modal3dVisible}
        onClose={cerrarVisor3d}
        modelUrl={currentModelUrl}
        productName={currentProductName}
      />
    </View>
  );
}