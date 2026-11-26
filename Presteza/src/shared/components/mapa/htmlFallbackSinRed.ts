/** Capa HTML compartida: aviso si no hay red o fallan CDN/tiles. */

export const cssFallbackSinRed = `
#sin-red {
  display: none; position: absolute; inset: 0; z-index: 20;
  flex-direction: column; align-items: center; justify-content: center;
  padding: 28px 24px; text-align: center;
  background: #3a0c20; color: #f5ebe0;
  font-family: Georgia, 'Times New Roman', serif;
}
#sin-red h1 { margin: 0; font-size: 26px; font-weight: 600; color: #d4af77; }
#sin-red p {
  margin: 12px 0 0; max-width: 280px;
  font: 400 13px/1.45 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: rgba(245, 235, 224, 0.72);
}
#sin-red button {
  margin-top: 20px; padding: 10px 18px;
  border: 1px solid #d4af77; background: transparent;
  color: #d4af77; font: 500 12px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer;
}
`;

export const htmlCapaSinRed = `
<div id="sin-red" role="alert">
  <h1>Sin conexión</h1>
  <p>El mapa necesita internet para mostrarse. Revisa tu red e inténtalo de nuevo.</p>
  <button type="button" onclick="location.reload()">Reintentar</button>
</div>
`;

/** Script corto: define mostrarSinRed + escucha offline. Ir antes de los CDN. */
export const jsAntesCdnSinRed = `
window.__mapaSinRed = function () {
  var el = document.getElementById('sin-red');
  if (el) el.style.display = 'flex';
};
window.addEventListener('offline', function () {
  window.__mapaSinRed && window.__mapaSinRed();
});
if (typeof navigator !== 'undefined' && navigator.onLine === false) {
  window.__mapaSinRed();
}
`;
