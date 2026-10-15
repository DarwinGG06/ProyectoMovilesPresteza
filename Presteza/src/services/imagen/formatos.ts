export type ArchivoImagen = {
  uri: string;
  mime: string;
  nombre: string;
};

export const TAMANO_MAXIMO_BYTES = 10 * 1024 * 1024;

const MIME_PERMITIDOS = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const EXT_PERMITIDAS = new Set(['jpg', 'jpeg', 'png', 'webp']);

export class ImagenInvalidaError extends Error {
  constructor(mensaje = 'Usa JPG, JPEG, PNG o WebP.') {
    super(mensaje);
    this.name = 'ImagenInvalidaError';
  }
}

function extensionDe(nombreOUri: string) {
  const limpio = nombreOUri.split('?')[0].split('#')[0];
  const punto = limpio.lastIndexOf('.');
  if (punto < 0) return '';
  return limpio.slice(punto + 1).toLowerCase();
}

function mimeDesdeExtension(ext: string) {
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  return '';
}

export function mimeCanonico(mime: string) {
  const normal = mime.toLowerCase().split(';')[0].trim();
  return normal === 'image/jpg' ? 'image/jpeg' : normal;
}

export function validarFormatoImagen(mime?: string | null, nombreOUri?: string | null) {
  const tipo = mimeCanonico(mime ?? '');
  const ext = extensionDe(nombreOUri ?? '');

  if (tipo && MIME_PERMITIDOS.has(tipo)) return mimeCanonico(tipo);
  if (!tipo && EXT_PERMITIDAS.has(ext)) return mimeDesdeExtension(ext);
  if (tipo && EXT_PERMITIDAS.has(ext) && tipo.startsWith('image/')) return mimeDesdeExtension(ext);

  throw new ImagenInvalidaError();
}

export function validarTamano(bytes?: number | null) {
  if (bytes != null && bytes > TAMANO_MAXIMO_BYTES) {
    throw new ImagenInvalidaError('La imagen no puede pesar más de 10 MB.');
  }
}

export function nombreArchivo(nombre: string | null | undefined, mime: string, fallback: string) {
  const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg';
  const base = (nombre ?? '').trim();
  if (base && EXT_PERMITIDAS.has(extensionDe(base))) return base;
  return `${fallback}.${ext}`;
}
