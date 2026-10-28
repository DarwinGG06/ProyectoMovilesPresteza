/** URL + public_id: lo que se guarda en la BD. Nunca el archivo ni el secret. */

export type RecursoNube = {
  url: string;
  publicId: string;
};

export type TipoRecursoNube = 'image' | 'raw' | 'video';

/**
 * Saca el public_id de una URL de Cloudinary (fotos viejas sin columna).
 * En `raw` (modelos .glb) el public_id SÍ incluye la extensión; en `image` no.
 */
export function extraerPublicId(url?: string | null): string {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('cloudinary.com')) return '';
    const partes = parsed.pathname.split('/').filter(Boolean);
    const upload = partes.indexOf('upload');
    if (upload < 0) return '';
    const resto = partes.slice(upload + 1);
    const version = resto.findIndex((parte) => /^v\d+$/.test(parte));
    const idPartes = version >= 0 ? resto.slice(version + 1) : resto.filter((parte) => !parte.includes(','));
    const junto = decodeURIComponent(idPartes.join('/'));
    if (partes.includes('raw')) return junto;
    return junto.replace(/\.[a-zA-Z0-9]+$/, '');
  } catch {
    return '';
  }
}

export function recursoDesdeUrl(url: string): RecursoNube {
  return { url, publicId: extraerPublicId(url) };
}
