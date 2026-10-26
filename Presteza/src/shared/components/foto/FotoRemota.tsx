import { type ReactNode } from 'react';
import { type ImageStyle, type StyleProp } from 'react-native';
import { Image, type ImageContentFit } from 'expo-image';

type FotoRemotaProps = {
  uri?: string | null;
  contentFit?: ImageContentFit;
  style?: StyleProp<ImageStyle>;
  fallback?: ReactNode;
};

/** Foto remota: `expo-image` la cachea en disco. La BD solo guarda la URL. */
export function FotoRemota({ uri, contentFit = 'cover', style, fallback }: FotoRemotaProps) {
  if (!uri) return <>{fallback}</>;
  return (
    <Image
      source={{ uri }}
      style={[{ width: '100%', height: '100%' }, style]}
      contentFit={contentFit}
      cachePolicy="disk"
      transition={180}
    />
  );
}
