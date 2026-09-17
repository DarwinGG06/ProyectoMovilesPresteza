// src/shared/components/ModelViewerModal.tsx
import React, { useState, useEffect } from 'react';
import { View, Modal, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons'; 
import * as FileSystem from 'expo-file-system/legacy';

interface ModelViewerModalProps {
  isVisible: boolean;
  onClose: () => void;
  modelUrl: string | null;
  productName: string | null;
}

export function ModelViewerModal({ isVisible, onClose, modelUrl, productName }: ModelViewerModalProps) {
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);

  // Convierte archivos locales (file://) a Data URI en Base64 para saltar políticas CORS del WebView
  useEffect(() => {
    let montado = true;

    async function prepararFuenteModelo() {
      if (!modelUrl) {
        setProcessedUrl(null);
        return;
      }

      // Si es una URL remota o ya está en base64, usar directamente
      if (modelUrl.startsWith('http://') || modelUrl.startsWith('https://') || modelUrl.startsWith('data:')) {
        setProcessedUrl(modelUrl);
        return;
      }

      // Si es un archivo local (file://), lo convertimos a Base64
      if (modelUrl.startsWith('file://')) {
        try {
          setProcesando(true);
          const base64 = await FileSystem.readAsStringAsync(modelUrl, {
            encoding: FileSystem.EncodingType.Base64,
          });
          if (montado) {
            setProcessedUrl(`data:model/gltf-binary;base64,${base64}`);
          }
        } catch (err) {
          console.error('Error al convertir modelo local a Base64:', err);
          if (montado) setProcessedUrl(modelUrl);
        } finally {
          if (montado) setProcesando(false);
        }
      } else {
        setProcessedUrl(modelUrl);
      }
    }

    prepararFuenteModelo();

    return () => {
      montado = false;
    };
  }, [modelUrl]);

  if (!modelUrl) return null;

  const htmlViewer = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <title>Vista 3D</title>
      <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"></script>
      <style>
        body { margin: 0; padding: 0; width: 100vw; height: 100vh; background-color: #0d0d0d; overflow: hidden; font-family: sans-serif; }
        model-viewer {
          width: 100%;
          height: 100%;
          --poster-color: transparent;
        }
        #error-text {
          display: none;
          color: #ff6b6b;
          text-align: center;
          padding: 20px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      </style>
    </head>
    <body>
      <div id="error-text">No se pudo renderizar el modelo 3D.</div>
      <model-viewer 
        src="${processedUrl || ''}" 
        camera-controls 
        auto-rotate
        shadow-intensity="1"
        exposure="1"
        environment-image="neutral"
        onerror="document.getElementById('error-text').style.display='block'"
      >
        <div slot="poster" style="display: flex; justify-content: center; align-items: center; height: 100%; color: #d4af77;">
            Cargando modelo 3D...
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

        {/* Visor 3D */}
        <View className="flex-1 bg-black">
          {procesando ? (
            <View className="flex-1 items-center justify-center bg-marca-oscura">
              <ActivityIndicator size="large" color="#d4af77" />
              <Text className="text-[#d4af77] mt-4">Procesando archivo 3D local...</Text>
            </View>
          ) : (
            <WebView
              originWhitelist={['*']}
              source={{ html: htmlViewer, baseUrl: 'file:///' }}
              style={{ backgroundColor: '#0d0d0d' }}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              allowFileAccess={true}
              allowFileAccessFromFileURLs={true}
              allowUniversalAccessFromFileURLs={true}
              mixedContentMode="always"
              androidLayerType="hardware"
              startInLoadingState={true}
              renderLoading={() => (
                <View className="absolute inset-0 items-center justify-center bg-marca-oscura">
                  <ActivityIndicator size="large" color="#d4af77" />
                  <Text className="text-[#d4af77] mt-4">Iniciando visor...</Text>
                </View>
              )}
            />
          )}
        </View>
        
        {/* Controles de instrucción */}
        <View className="px-5 py-3 items-center border-t border-white/10 bg-marca-oscura">
            <Text className="text-xs text-crema/60">Gira con un dedo · Haz zoom pellizcando</Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
}