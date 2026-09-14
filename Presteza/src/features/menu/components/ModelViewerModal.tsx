// src/shared/components/ModelViewerModal.tsx
import React from 'react';
import { View, Modal, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons'; 

interface ModelViewerModalProps {
  isVisible: boolean;
  onClose: () => void;
  modelUrl: string | null;
  productName: string | null;
}

export function ModelViewerModal({ isVisible, onClose, modelUrl, productName }: ModelViewerModalProps) {
  
  if (!modelUrl) return null;

  // Cambiamos el CDN a unpkg y simplificamos los atributos del model-viewer para máxima compatibilidad
  const htmlViewer = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <title>Vista 3D</title>
      <script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>
      <style>
        body { margin: 0; padding: 0; width: 100vw; height: 100vh; background-color: #0d0d0d; overflow: hidden; font-family: sans-serif; }
        model-viewer {
          width: 100%;
          height: 100%;
          --poster-color: transparent;
        }
      </style>
    </head>
    <body>
      <model-viewer 
        src="${modelUrl}" 
        camera-controls 
        auto-rotate
        shadow-intensity="1"
        exposure="1"
        environment-image="neutral"
      >
        <div slot="poster" style="display: flex; justify-content: center; align-items: center; height: 100%; color: #d4af77;">
            Cargando el modelo 3D...
        </div>
      </model-viewer>
    </body>
    </html>
  `;

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-marca-oscura">
        {/* Cabecera del Modal */}
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-white/10">
          <Text className="text-xl font-bold text-crema" numberOfLines={1}>
            {productName || 'Vista 3D'}
          </Text>
          <TouchableOpacity onPress={onClose} className="p-2 rounded-full bg-black/30">
            <Ionicons name="close" size={24} color="#d4af77" />
          </TouchableOpacity>
        </View>

        {/* Contenedor del WebView con PERMISOS EXTRA */}
        <View className="flex-1 bg-black">
          <WebView
            originWhitelist={['*']}
            source={{ html: htmlViewer }}
            style={{ backgroundColor: '#0d0d0d' }}
            
            // Permisos clave para Android/iOS para renderizar 3D:
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowFileAccessFromFileURLs={true}
            allowUniversalAccessFromFileURLs={true}
            mixedContentMode="always"
            
            startInLoadingState={true}
            renderLoading={() => (
              <View className="absolute inset-0 items-center justify-center bg-marca-oscura">
                <ActivityIndicator size="large" color="#d4af77" />
                <Text className="text-[#d4af77] mt-4">Iniciando visor...</Text>
              </View>
            )}
          />
        </View>
        
        {/* Footer simple indicando interacción */}
        <View className="px-5 py-3 items-center border-t border-white/10 bg-marca-oscura">
            <Text className="text-xs text-crema/60">Gira con un dedo · Haz zoom pellizcando</Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
}