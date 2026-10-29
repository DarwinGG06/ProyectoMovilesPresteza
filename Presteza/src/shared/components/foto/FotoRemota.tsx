import { type ReactNode } from 'react';
import { Image, type ImageStyle, type StyleProp } from 'react-native';

type FotoRemotaProps = {
  uri?: string | null;
  contentFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  style?: StyleProp<ImageStyle>;
  fallback?: ReactNode;
};

function uriLimpia(uri?: string | null) {
  return typeof uri === 'string' ? uri.trim() : '';
}

/** Foto remota. Si no hay URL válida, se muestra el fallback. */
export function FotoRemota({ uri, contentFit = 'cover', style, fallback }: FotoRemotaProps) {
  const fuente = uriLimpia(uri);
  if (!fuente) return <>{fallback}</>;

  return (
    <Image
      source={{ uri: fuente }}
      style={[{ width: '100%', height: '100%' }, style]}
      resizeMode={contentFit === 'contain' ? 'contain' : 'cover'}
    />
  );
}
