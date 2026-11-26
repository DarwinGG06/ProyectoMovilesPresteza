import { useState } from 'react';
import { Platform, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { MapaSinRed } from '@/shared/components/mapa/MapaSinRed';

import { SEDE } from '../data';
import { htmlMapaSede } from '../mapa';

export function MapaSede({ alto = 320 }: { alto?: number }) {
  const html = htmlMapaSede(SEDE.lat, SEDE.lng);
  const [errorNativo, setErrorNativo] = useState(false);

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

  if (errorNativo) {
    return <MapaSinRed alto={alto} />;
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
        onError={() => setErrorNativo(true)}
        renderError={() => <MapaSinRed alto={alto} />}
      />
    </View>
  );
}
