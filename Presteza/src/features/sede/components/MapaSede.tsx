import { Platform, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { SEDE } from '../data';
import { htmlMapaSede } from '../mapa';

export function MapaSede({ alto = 320 }: { alto?: number }) {
  const html = htmlMapaSede(SEDE.lat, SEDE.lng);

  if (Platform.OS === 'web') {
    return (
      <View style={{ height: alto, overflow: 'hidden' }}>
        <iframe
          srcDoc={html}
          title="Sede Presteza en Manizales"
          width="100%"
          height={alto}
          style={{ border: 0 }}
          sandbox="allow-scripts allow-same-origin"
        />
      </View>
    );
  }

  return (
    <View style={{ height: alto }}>
      <WebView
        source={{ html, baseUrl: 'https://unpkg.com/' }}
        style={{ flex: 1 }}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
        setSupportMultipleWindows={false}
        nestedScrollEnabled
      />
    </View>
  );
}
