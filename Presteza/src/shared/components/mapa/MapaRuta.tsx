import { useEffect, useMemo, useRef } from 'react';
import { Platform, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { htmlMapaRuta, type PuntoMapa } from './htmlMapaRuta';

function scriptPunto(punto?: PuntoMapa | null) {
  if (!punto || !Number.isFinite(punto.lat) || !Number.isFinite(punto.lng)) return '';
  return `window.ponerRepartidor && window.ponerRepartidor(${punto.lat}, ${punto.lng}); true;`;
}

export function MapaRuta({
  alto = 340,
  repartidor,
}: {
  alto?: number;
  repartidor?: PuntoMapa | null;
}) {
  const html = useMemo(() => htmlMapaRuta(), []);
  const web = useRef<WebView>(null);
  const marco = useRef<HTMLIFrameElement | null>(null);
  const lat = repartidor?.lat;
  const lng = repartidor?.lng;

  useEffect(() => {
    const js = scriptPunto(
      lat != null && lng != null ? { lat, lng } : null,
    );
    if (!js) return;

    if (Platform.OS === 'web') {
      const ventana = marco.current?.contentWindow as (Window & { eval?: (code: string) => unknown }) | null;
      try {
        ventana?.eval?.(js);
      } catch {
        // El iframe aún no cargó.
      }
      return;
    }

    web.current?.injectJavaScript(js);
  }, [lat, lng]);

  if (Platform.OS === 'web') {
    const conPunto =
      lat != null && lng != null
        ? html.replace(
            'window.mapaListo = true;',
            `window.mapaListo = true; window.ponerRepartidor(${lat}, ${lng});`,
          )
        : html;
    return (
      <View style={{ height: alto, overflow: 'hidden' }}>
        <iframe
          ref={marco as never}
          srcDoc={conPunto}
          title="Ruta del domicilio"
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
        ref={web}
        source={{ html, baseUrl: 'https://unpkg.com/' }}
        style={{ flex: 1, backgroundColor: '#eef2f5' }}
        androidLayerType="hardware"
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
        setSupportMultipleWindows={false}
        nestedScrollEnabled
        onLoadEnd={() => {
          const js = scriptPunto(lat != null && lng != null ? { lat, lng } : null);
          if (js) web.current?.injectJavaScript(js);
        }}
      />
    </View>
  );
}
