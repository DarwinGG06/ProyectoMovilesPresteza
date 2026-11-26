/**
 * Google Maps URLs API (no pide clave):
 * https://developers.google.com/maps/documentation/urls/get-started
 *
 * Torre Plaza 70 · Cra. 23 #70B-57 · Milán, Manizales
 */
import {
  cssFallbackSinRed,
  htmlCapaSinRed,
  jsAntesCdnSinRed,
} from '@/shared/components/mapa/htmlFallbackSinRed';

export const COORDENADAS_SEDE = {
  lat: 5.050441,
  lng: -75.48353,
};

export function htmlMapaSede(lat: number, lng: number) {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
      html, body, #mapa { margin: 0; height: 100%; width: 100%; background: #3a0c20; }
      body { position: relative; }
      .leaflet-control-attribution { font-size: 9px; }
      ${cssFallbackSinRed}
    </style>
  </head>
  <body>
    <div id="mapa"></div>
    ${htmlCapaSinRed}
    <script>${jsAntesCdnSinRed}</script>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" onerror="window.__mapaSinRed && window.__mapaSinRed()"></script>
    <script>
      if (typeof L === 'undefined') {
        window.__mapaSinRed && window.__mapaSinRed();
      } else {
        var tilesListos = false;
        var mapa = L.map('mapa', { zoomControl: true, attributionControl: true })
          .setView([${lat}, ${lng}], 18);
        var capa = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          { maxZoom: 19, attribution: 'Esri' }
        );
        capa.on('load', function () {
          tilesListos = true;
          var aviso = document.getElementById('sin-red');
          if (aviso) aviso.style.display = 'none';
        });
        capa.addTo(mapa);
        L.marker([${lat}, ${lng}]).addTo(mapa).bindPopup('Presteza · Torre Plaza 70');
        setTimeout(function () {
          if (!tilesListos) window.__mapaSinRed && window.__mapaSinRed();
        }, 10000);
      }
    </script>
  </body>
</html>`;
}

export function urlMapaVer(lat: number, lng: number) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

export function urlMapaComoLlegar(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}
