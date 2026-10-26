/**
 * Modelos 3D de los platos.
 *
 * Solo se acepta `.glb` (glTF binario): es un único archivo con la geometría,
 * las texturas y los materiales adentro, que es lo que lee el visor del menú.
 * Un `.gltf` normal no sirve porque trae las texturas en archivos aparte.
 */

import * as DocumentPicker from 'expo-document-picker';

import { subirACloudinary, type ArchivoSubida } from '../imagen/subirACloudinary';

export type ArchivoModelo3d = ArchivoSubida;

/** Cloudinary (plan gratuito) no acepta archivos `raw` de más de 10 MB. */
export const TAMANO_MAXIMO_MODELO_BYTES = 10 * 1024 * 1024;

const MIME_GLB = 'model/gltf-binary';

export class Modelo3dInvalidoError extends Error {
  constructor(mensaje = 'Usa un archivo .glb.') {
    super(mensaje);
    this.name = 'Modelo3dInvalidoError';
  }
}

function esGlb(nombreOUri: string) {
  const limpio = nombreOUri.split('?')[0].split('#')[0].toLowerCase();
  return limpio.endsWith('.glb');
}

export async function elegirModelo3d(): Promise<ArchivoModelo3d | null> {
  // Android no conoce el tipo MIME de los .glb (los marca como
  // `application/octet-stream`), así que se deja elegir cualquier archivo y
  // se valida por la extensión.
  const resultado = await DocumentPicker.getDocumentAsync({
    type: '*/*',
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (resultado.canceled || !resultado.assets[0]) return null;

  const archivo = resultado.assets[0];
  const nombre = archivo.name || archivo.uri.split('/').pop() || 'modelo.glb';

  if (!esGlb(nombre) && !esGlb(archivo.uri)) {
    throw new Modelo3dInvalidoError();
  }
  if (archivo.size != null && archivo.size > TAMANO_MAXIMO_MODELO_BYTES) {
    throw new Modelo3dInvalidoError('El modelo no puede pesar más de 10 MB.');
  }

  return {
    uri: archivo.uri,
    mime: MIME_GLB,
    nombre: esGlb(nombre) ? nombre : `${nombre}.glb`,
  };
}

/** Sube el .glb a Cloudinary como archivo `raw` y devuelve su URL pública. */
export async function subirModelo3d(archivo: ArchivoModelo3d): Promise<string> {
  const recurso = await subirACloudinary(archivo, 'raw');
  return recurso.url;
}

/** Nombre corto para mostrar en el formulario a partir de la URL guardada. */
export function nombreDesdeUrl(url: string) {
  const ultimo = url.split('?')[0].split('/').pop() ?? '';
  return decodeURIComponent(ultimo) || 'modelo.glb';
}
