/**
 * Google Maps URLs API (no pide clave):
 * https://developers.google.com/maps/documentation/urls/get-started
 *
 * Torre Plaza 70 · Cra. 23 #70B-57 · Milán, Manizales
 */
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
      .leaflet-control-attribution { font-size: 9px; }
    </style>
  </head>
  <body>
    <div id="mapa"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      const mapa = L.map('mapa', { zoomControl: true, attributionControl: true })
        .setView([${lat}, ${lng}], 18);
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, attribution: 'Esri' }
      ).addTo(mapa);
      L.marker([${lat}, ${lng}]).addTo(mapa).bindPopup('Presteza · Torre Plaza 70');
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
