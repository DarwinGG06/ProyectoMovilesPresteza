const fs = require('fs');
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

// 1. Obtener la configuración base de Expo
const defaultConfig = getDefaultConfig(__dirname);

// 2. Agregar extensiones de modelos 3D a los assets reconocidos
defaultConfig.resolver.assetExts.push('glb', 'gltf');

// 3. Aplicar la configuración de NativeWind
const config = withNativeWind(defaultConfig, { input: './global.css' });

// 4. Guardar la resolución previa procesada por NativeWind
const previousResolve = config.resolver.resolveRequest;

// 5. Aplicar la lógica personalizada del resolver para web
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const origen = (context.originModulePath || '').replace(/\\/g, '/');

  if (
    platform === 'web' &&
    origen.includes('react-native-web/dist/') &&
    moduleName.startsWith('./')
  ) {
    const directo = path.join(path.dirname(context.originModulePath), moduleName);
    const comoIndice = path.join(directo, 'index.js');
    const comoArchivo = `${directo}.js`;

    if (fs.existsSync(comoIndice)) {
      return { type: 'sourceFile', filePath: comoIndice };
    }
    if (fs.existsSync(comoArchivo)) {
      return { type: 'sourceFile', filePath: comoArchivo };
    }
  }

  if (previousResolve) {
    return previousResolve(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;