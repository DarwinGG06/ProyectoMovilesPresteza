import { useEffect, useMemo, useRef } from 'react';
import { Platform, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { htmlMapaRuta, type PuntoMapa } from './htmlMapaRuta';

function scriptMoto(repartidor?: PuntoMapa | null) {
  if (!repartidor || !Number.isFinite(repartidor.lat) || !Number.isFinite(repartidor.lng)) return '';
  return `window.ponerRepartidor && window.ponerRepartidor(${repartidor.lat}, ${repartidor.lng}); true;`;
}

export function MapaRuta({
  alto = 340,
  repartidor,
  destino,
}: {
  alto?: number;
  repartidor?: PuntoMapa | null;
  destino?: PuntoMapa | null;
}) {
  const html = useMemo(() => htmlMapaRuta(destino ?? null), [destino?.lat, destino?.lng]);
  const web = useRef<WebView>(null);
  const marco = useRef<HTMLIFrameElement | null>(null);
  const js = scriptMoto(repartidor);
  const clave = `d:${destino?.lat ?? 'x'}:${destino?.lng ?? 'x'}`;

  useEffect(() => {
    if (!js) return;
    if (Platform.OS === 'web') {
      try {
        (marco.current?.contentWindow as (Window & { eval?: (c: string) => unknown }) | null)?.eval?.(js);
      } catch {
        // iframe aún no listo
      }
      return;
    }
    web.current?.injectJavaScript(js);
  }, [js, clave]);

  if (Platform.OS === 'web') {
    const src = js
      ? html.replace('window.mapaListo = true;', `window.mapaListo = true; ${js}`)
      : html;
    return (
      <View style={{ height: alto, overflow: 'hidden' }}>
        <iframe
          key={clave}
          ref={marco as never}
          srcDoc={src}
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
        key={clave}
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
          if (js) web.current?.injectJavaScript(js);
        }}
      />
    </View>
  );
}
