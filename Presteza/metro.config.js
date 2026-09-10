const fs = require('fs');
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = withNativeWind(getDefaultConfig(__dirname), { input: './global.css' });
const previousResolve = config.resolver.resolveRequest;

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
