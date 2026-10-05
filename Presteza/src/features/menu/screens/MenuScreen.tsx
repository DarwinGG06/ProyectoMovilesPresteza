// src/features/menu/screens/MenuScreen.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import { Asset } from 'expo-asset'; // <-- IMPORTANTE

import { Footer } from '@/shared/components/footer';
import { EvitarTeclado } from '@/shared/components/evitar-teclado/EvitarTeclado';
import { SelloP } from '@/shared/components/nav-bar/SelloP';
import { useMenuPublico } from '../hooks/useMenuPublico';
import { ModelViewerModal } from '@/features/menu/components/ModelViewerModal'; 

// Cargas el archivo local usando require
const MODELO_LOCAL_ASSET = require('@/assets/ice_cream.glb'); // Ajusta tu ruta aquí

export function MenuScreen() {
  const { productos, categorias, cargando, error } = useMenuPublico();
  
  const [busqueda, setBusqueda] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);

  const [modal3dVisible, setModal3dVisible] = useState(false);
  const [currentModelUrl, setCurrentModelUrl] = useState<string | null>(null);
  const [currentProductName, setCurrentProductName] = useState<string | null>(null);

  // Estado para guardar la URI procesada del asset local
  const [localModelUri, setLocalModelUri] = useState<string | null>(null);

  // Precalcula/descarga la URI del asset local al montar el componente
  useEffect(() => {
    async function prepararAssetLocal() {
      const asset = Asset.fromModule(MODELO_LOCAL_ASSET);
      await asset.downloadAsync();
      setLocalModelUri(asset.localUri || asset.uri);
    }
    prepararAssetLocal();
  }, []);

  const productosFiltrados = useMemo(() => {
    return productos.filter((producto) => {
      const coincideBusqueda = 
        producto.name.toLowerCase().includes(busqueda.toLowerCase()) || 
        (producto.description && producto.description.trim().toLowerCase().includes(busqueda.toLowerCase()));
      
      const coincideCategoria = categoriaActiva ? producto.categoryId === categoriaActiva : true;
      
      return coincideBusqueda && coincideCategoria;
    });
  }, [productos, busqueda, categoriaActiva]);

  // FUNCIÓN ACTUALIZADA: Prioriza la URL del backend, si no existe usa el archivo local
  const abrirVisor3d = (productoName: string, backendModelUrl?: string) => {
    const urlToOpen = backendModelUrl || localModelUri;
    setCurrentModelUrl(urlToOpen);
    setCurrentProductName(productoName);
    setModal3dVisible(true);
  };

  const cerrarVisor3d = () => {
    setModal3dVisible(false);
    setTimeout(() => {
      setCurrentModelUrl(null);
      setCurrentProductName(null);
    }, 300);
  };

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
    <EvitarTeclado>
      <View className="flex-1 bg-marca-oscura">
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        
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
              placeholderTextColor="rgba(212, 175, 119, 0.5)"
              value={busqueda}
              onChangeText={setBusqueda}
            />
          </View>

          {/* Categorías */}
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

          {/* Lista de productos */}
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

                    <TouchableOpacity 
                      className="absolute bottom-1 right-1 bg-black/70 p-1.5 rounded-full border border-[#d4af77]/50"
                      onPress={() => abrirVisor3d(producto.name, (producto as any).modelUrl)}
                    >
                      <Ionicons name="cube-outline" size={16} color="#d4af77" />
                    </TouchableOpacity>
                  </View>

                  <View className="flex-1 justify-center">
                    <Text className="text-lg font-bold text-crema mb-1">{producto.name}</Text>
                    {producto.description && (
                      <Text className="text-sm text-crema/60 mb-2" numberOfLines={2}>
                        {producto.description}
                      </Text>
                    )}
                    <Text className="text-[#d4af77] font-bold text-base">
                      ${(Number(producto.price) || 0).toLocaleString('es-CO')}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

        </View>
        <Footer />
      </ScrollView>

      <ModelViewerModal 
        isVisible={modal3dVisible}
        onClose={cerrarVisor3d}
        modelUrl={currentModelUrl}
        productName={currentProductName}
      />
      </View>
    </EvitarTeclado>
  );
}