import { Image, type ImageStyle } from 'expo-image';
import { type ReactNode } from 'react';
import { type StyleProp } from 'react-native';

type FotoRemotaProps = {
  uri?: string | null;
  contentFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  style?: StyleProp<ImageStyle>;
  fallback?: ReactNode;
};

function uriLimpia(uri?: string | null) {
  return typeof uri === 'string' ? uri.trim() : '';
}

/**
 * Foto remota con `expo-image`: guarda la imagen en memoria y en disco, así que
 * la carta no vuelve a descargar las fotos de Cloudinary cada vez que se abre.
 * Si no hay URL válida, se muestra el fallback.
 *
 * Ocupa el 100% de su contenedor: el tamaño se le da al `View` que la envuelve.
 */
export function FotoRemota({ uri, contentFit = 'cover', style, fallback }: FotoRemotaProps) {
  const fuente = uriLimpia(uri);
  if (!fuente) return <>{fallback}</>;

  return (
    <Image
      source={{ uri: fuente }}
      style={[{ width: '100%', height: '100%' }, style]}
      contentFit={contentFit}
      cachePolicy="memory-disk"
      transition={150}
      // Evita que una celda reciclada muestre la foto del plato anterior.
      recyclingKey={fuente}
    />
  );
}
