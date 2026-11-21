import { COORDENADAS_SEDE } from '@/features/sede/mapa';

export type PuntoMapa = { lat: number; lng: number };

function numero(valor: number) {
  return Number.isFinite(valor) ? String(valor) : '0';
}

/** P = sede; casita = destino; moto = repartidor. */
export function htmlMapaRuta(destinoInicial?: PuntoMapa | null) {
  const lat = numero(COORDENADAS_SEDE.lat);
  const lng = numero(COORDENADAS_SEDE.lng);
  const dLat =
    destinoInicial && Number.isFinite(destinoInicial.lat) ? numero(destinoInicial.lat) : '';
  const dLng =
    destinoInicial && Number.isFinite(destinoInicial.lng) ? numero(destinoInicial.lng) : '';

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
      .marca.sede { background: #6b1d3d; color: #d4af77; font: 700 16px/1 serif; }
      .marca.casa { background: #ffffff; }
      .marca.moto { background: #e07a3d; }
    </style>
  </head>
  <body>
    <div id="mapa"></div>
    <script src="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js"></script>
    <script>
      const sede = [${lng}, ${lat}];
      const destino0 = ${dLat && dLng ? `[${dLng}, ${dLat}]` : 'null'};
      let destino = destino0;
      // Solo perímetro urbano de Manizales (no se sale de la ciudad).
      const manizales = [[-75.545, 5.035], [-75.465, 5.085]];
      const mapa = new maplibregl.Map({
        container: 'mapa',
        style: 'https://tiles.openfreemap.org/styles/positron',
        center: destino0 || sede,
        zoom: 15.2,
        minZoom: 12.5,
        maxZoom: 18,
        maxBounds: manizales,
        pitch: 58,
        bearing: -18,
        attributionControl: true,
      });
      mapa.dragRotate.enable();
      mapa.touchZoomRotate.enable();
      function nodo(html) {
        const w = document.createElement('div');
        w.innerHTML = html;
        return w.firstElementChild;
      }
      const htmlSede = '<div class="marca sede">P</div>';
      const htmlCasa = '<div class="marca casa"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 11.5 12 4l8 7.5" stroke="#2c333a" stroke-width="2" stroke-linejoin="round"/><path d="M7 10.5V20h10v-9.5" stroke="#2c333a" stroke-width="2"/></svg></div>';
      const htmlMoto = '<div class="marca moto"><svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="6.5" cy="16.5" r="2.6" stroke="#fff" stroke-width="1.8"/><circle cx="17.5" cy="16.5" r="2.6" stroke="#fff" stroke-width="1.8"/><path d="M9.2 16.2h5.2L16 12.2h2.4l1.2 2.2M4.2 16.2H3l1.4-3.4h3.2L9.2 16.2z" stroke="#fff" stroke-width="1.7" stroke-linejoin="round"/><path d="M12.2 12.2 10.6 8.4H8.4" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/></svg></div>';
      new maplibregl.Marker({ element: nodo(htmlSede), anchor: 'center' }).setLngLat(sede).addTo(mapa);
      let marcaCasa = null;
      let marcaMoto = null;
      let ajustado = false;
      function listo(fn) {
        if (mapa.isStyleLoaded()) fn();
        else {
          mapa.once('load', fn);
          setTimeout(function () { try { fn(); } catch (e) {} }, 1800);
        }
      }
      function encuadrar(extra) {
        const b = new maplibregl.LngLatBounds(sede, sede);
        if (destino) b.extend(destino);
        if (extra) b.extend(extra);
        mapa.fitBounds(b, { padding: 64, maxZoom: 16.2, pitch: 58, bearing: -18, duration: ajustado ? 700 : 0 });
        ajustado = true;
      }
      function pintar() {
        if (mapa.getLayer('building')) mapa.setLayoutProperty('building', 'visibility', 'none');
        ['park', 'landcover_wood'].forEach(function (id) {
          if (mapa.getLayer(id)) mapa.setPaintProperty(id, 'fill-color', '#b7e4c7');
        });
        if (mapa.getLayer('water')) mapa.setPaintProperty('water', 'fill-color', '#b9dff5');
        if (mapa.getLayer('background')) mapa.setPaintProperty('background', 'background-color', '#eef2f5');
        if (mapa.getLayer('edificios-3d')) return;
        const simbolo = mapa.getStyle().layers.find(function (c) { return c.type === 'symbol'; });
        mapa.addLayer({
          id: 'edificios-3d', type: 'fill-extrusion', source: 'openmaptiles', 'source-layer': 'building', minzoom: 14,
          paint: {
            'fill-extrusion-color': '#f7f7f5', 'fill-extrusion-opacity': 0.96,
            'fill-extrusion-base': ['coalesce', ['to-number', ['get', 'render_min_height']], 0],
            'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 14, 0, 16, ['max', ['coalesce', ['to-number', ['get', 'render_height']], 0], 16]]
          }
        }, simbolo && simbolo.id);
      }
      mapa.on('load', pintar);
      window.ponerDestino = function (la, ln) {
        if (!Number.isFinite(la) || !Number.isFinite(ln)) return;
        listo(function () {
          destino = [ln, la];
          if (!marcaCasa) marcaCasa = new maplibregl.Marker({ element: nodo(htmlCasa), anchor: 'center' }).setLngLat(destino).addTo(mapa);
          else marcaCasa.setLngLat(destino);
          encuadrar(marcaMoto ? marcaMoto.getLngLat() : null);
        });
      };
      window.ponerRepartidor = function (la, ln) {
        if (!Number.isFinite(la) || !Number.isFinite(ln)) return;
        listo(function () {
          const p = [ln, la];
          if (!marcaMoto) {
            marcaMoto = new maplibregl.Marker({ element: nodo(htmlMoto), anchor: 'center' }).setLngLat(p).addTo(mapa);
            encuadrar(p);
          } else {
            marcaMoto.setLngLat(p);
            mapa.easeTo({ center: p, pitch: 58, duration: 900 });
          }
        });
      };
      if (destino0) listo(function () { window.ponerDestino(destino0[1], destino0[0]); });
      window.mapaListo = true;
    </script>
  </body>
</html>`;
}
