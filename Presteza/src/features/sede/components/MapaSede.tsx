import { Platform, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { SEDE } from '../data';

export function MapaSede({ alto = 280 }: { alto?: number }) {
  if (Platform.OS === 'web') {
    return (
      <View style={{ height: alto, overflow: 'hidden' }}>
        <iframe
          src={SEDE.mapaEmbed}
          title="Sede Presteza en Manizales"
          width="100%"
          height={alto}
          style={{ border: 0 }}
        />
      </View>
    );
  }

  return (
    <View style={{ height: alto }}>
      <WebView source={{ uri: SEDE.mapaEmbed }} style={{ flex: 1 }} />
    </View>
  );
}
