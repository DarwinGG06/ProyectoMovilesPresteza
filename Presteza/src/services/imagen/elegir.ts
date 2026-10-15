import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

import {
  nombreArchivo,
  validarFormatoImagen,
  validarTamano,
  type ArchivoImagen,
} from './formatos';

function dePicker(asset: {
  uri: string;
  mimeType?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
}): ArchivoImagen {
  validarTamano(asset.fileSize);
  const mime = validarFormatoImagen(asset.mimeType, asset.fileName ?? asset.uri);
  return {
    uri: asset.uri,
    mime,
    nombre: nombreArchivo(asset.fileName, mime, 'plato'),
  };
}

async function deImagen(lanzar: () => Promise<ImagePicker.ImagePickerResult>): Promise<ArchivoImagen | null> {
  const resultado = await lanzar();
  if (resultado.canceled || !resultado.assets[0]) return null;
  return dePicker(resultado.assets[0]);
}

const opciones: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  quality: 0.85,
  allowsEditing: true,
  aspect: [4, 3],
};

export async function elegirDesdeCamara(): Promise<ArchivoImagen | null> {
  const permiso = await ImagePicker.requestCameraPermissionsAsync();
  if (!permiso.granted) {
    throw new Error('Activa el permiso de cámara para fotografiar el plato.');
  }
  return deImagen(() => ImagePicker.launchCameraAsync(opciones));
}

export async function elegirDesdeGaleria(): Promise<ArchivoImagen | null> {
  if (Platform.OS !== 'web') {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      throw new Error('Activa el permiso de galería para elegir la foto del plato.');
    }
  }
  return deImagen(() => ImagePicker.launchImageLibraryAsync(opciones));
}

export async function elegirDesdeArchivo(): Promise<ArchivoImagen | null> {
  const resultado = await DocumentPicker.getDocumentAsync({
    type: ['image/jpeg', 'image/png', 'image/webp'],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (resultado.canceled || !resultado.assets[0]) return null;
  const archivo = resultado.assets[0];
  return dePicker({
    uri: archivo.uri,
    mimeType: archivo.mimeType,
    fileName: archivo.name,
    fileSize: archivo.size,
  });
}
