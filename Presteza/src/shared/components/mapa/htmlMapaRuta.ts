import { COORDENADAS_SEDE } from '@/features/sede/mapa';

export type PuntoMapa = { lat: number; lng: number };

function numero(valor: number) {
  return Number.isFinite(valor) ? String(valor) : '0';
}

/** Mapa inclinado con edificios. La sede queda fija; el repartidor se mueve con `ponerRepartidor`. */
export function htmlMapaRuta() {
  const lat = numero(COORDENADAS_SEDE.lat);
  const lng = numero(COORDENADAS_SEDE.lng);

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css" />
    <style>
      html, body, #mapa { margin: 0; height: 100%; width: 100%; background: #eef1f4; }
      .maplibregl-ctrl-attrib { font-size: 9px; }
      .maplibregl-ctrl-logo { display: none; }
      .marca {
        width: 48px; height: 48px; border-radius: 24px; border: 3px solid #fff;
        box-shadow: 0 8px 18px rgba(30, 40, 50, 0.28);
        display: flex; align-items: center; justify-content: center;
      }
      .marca.casa { background: #ffffff; }
      .marca.persona { background: #e07a3d; }
    </style>
  </head>
  <body>
    <div id="mapa"></div>
    <script src="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js"></script>
    <script>
      const casa = [${lng}, ${lat}];
      const mapa = new maplibregl.Map({
        container: 'mapa',
        style: 'https://tiles.openfreemap.org/styles/positron',
        center: casa,
        zoom: 16.4,
        pitch: 58,
        bearing: -18,
        attributionControl: true,
      });
      mapa.dragRotate.enable();
      mapa.touchZoomRotate.enable();
      const htmlCasa = '<div class="marca casa"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 11.5 12 4l8 7.5" stroke="#2c333a" stroke-width="2" stroke-linejoin="round"/><path d="M7 10.5V20h10v-9.5" stroke="#2c333a" stroke-width="2"/></svg></div>';
      const htmlPersona = '<div class="marca persona"><svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><circle cx="12" cy="4.5" r="2.6"/><path d="M8 21v-1.4c0-2.4 1.7-3.8 4-3.8s4 1.4 4 3.8V21H8z"/><path d="M9.2 12.2 12 9.6l2.8 2.6-1.1 1.2V16H10.3v-2.6l-1.1-1.2z"/></svg></div>';
      const elCasa = document.createElement('div');
      elCasa.innerHTML = htmlCasa;
      const marcaCasa = new maplibregl.Marker({ element: elCasa.firstChild, anchor: 'center' })
        .setLngLat(casa)
        .addTo(mapa);
      let marca = null;
      let ajustado = false;
      function pintar() {
        if (mapa.getLayer('building')) mapa.setLayoutProperty('building', 'visibility', 'none');
        ['park', 'landcover_wood'].forEach(function (id) {
          if (mapa.getLayer(id)) mapa.setPaintProperty(id, 'fill-color', '#b7e4c7');
        });
        if (mapa.getLayer('water')) mapa.setPaintProperty('water', 'fill-color', '#b9dff5');
        if (mapa.getLayer('background')) mapa.setPaintProperty('background', 'background-color', '#eef2f5');
        if (mapa.getLayer('edificios-3d')) return;
        const simbolo = mapa.getStyle().layers.find(function (capa) { return capa.type === 'symbol'; });
        mapa.addLayer({
          id: 'edificios-3d',
          type: 'fill-extrusion',
          source: 'openmaptiles',
          'source-layer': 'building',
          minzoom: 14,
          paint: {
            'fill-extrusion-color': '#f7f7f5',
            'fill-extrusion-opacity': 0.96,
            'fill-extrusion-base': ['coalesce', ['to-number', ['get', 'render_min_height']], 0],
            'fill-extrusion-height': [
              'interpolate', ['linear'], ['zoom'],
              14, 0,
              16, ['max', ['coalesce', ['to-number', ['get', 'render_height']], 0], 16]
            ]
          }
        }, simbolo && simbolo.id);
      }
      mapa.on('load', pintar);
      window.ponerRepartidor = function (lat, lng) {
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
        const mover = function () {
          const punto = [lng, lat];
          if (!marca) {
            const el = document.createElement('div');
            el.innerHTML = htmlPersona;
            marca = new maplibregl.Marker({ element: el.firstChild, anchor: 'center' })
              .setLngLat(punto)
              .addTo(mapa);
          } else {
            marca.setLngLat(punto);
          }
          if (!ajustado) {
            const bounds = new maplibregl.LngLatBounds(casa, casa);
            bounds.extend(punto);
            mapa.fitBounds(bounds, { padding: 72, maxZoom: 16.6, pitch: 58, bearing: -18, duration: 0 });
            ajustado = true;
          } else {
            mapa.easeTo({ center: punto, pitch: 58, duration: 900 });
          }
        };
        if (mapa.isStyleLoaded()) mover();
        else mapa.once('load', mover);
      };
      window.mapaListo = true;
    </script>
  </body>
</html>`;
}
