import { Pressable, Text, View } from 'react-native';

import { FotoRemota } from '@/shared/components/foto/FotoRemota';
import { IconoNav } from '@/shared/components/nav-bar/IconoNav';

function BotonFuente({
  etiqueta,
  onPress,
  disabled,
}: {
  etiqueta: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="min-w-[30%] flex-1 border border-oro py-3 active:opacity-80 disabled:opacity-50">
      <Text className="text-center text-[10px] tracking-[2px] text-marca-oscura">{etiqueta}</Text>
    </Pressable>
  );
}

/** Campo de foto con cámara, galería y archivo. Se usa en platos y categorías. */
export function CampoImagenProducto({
  uri,
  error,
  disabled,
  titulo = 'Imagen del plato',
  onCamara,
  onGaleria,
  onArchivo,
}: {
  uri?: string;
  error?: string;
  disabled?: boolean;
  titulo?: string;
  onCamara: () => void;
  onGaleria: () => void;
  onArchivo: () => void;
}) {
  return (
    <View className="gap-1.5">
      <Text className="font-semibold text-marca-oscura">{titulo}</Text>
      <View
        className={`overflow-hidden border bg-white ${error ? 'border-red-600' : 'border-linea'}`}
        style={{ height: 168 }}>
        <FotoRemota
          uri={uri}
          fallback={
            <View className="flex-1 items-center justify-center gap-2">
              <IconoNav name="camera-outline" size={28} className="text-oro" />
              <Text className="text-[10px] tracking-[2px] text-texto/55">SIN FOTO</Text>
            </View>
          }
        />
      </View>
      <View className="mt-1 flex-row flex-wrap gap-2">
        <BotonFuente etiqueta="CÁMARA" onPress={onCamara} disabled={disabled} />
        <BotonFuente etiqueta="GALERÍA" onPress={onGaleria} disabled={disabled} />
        <BotonFuente etiqueta="ARCHIVO" onPress={onArchivo} disabled={disabled} />
      </View>
      <Text className="text-xs text-texto/55">JPG, JPEG, PNG o WebP. Máximo 10 MB.</Text>
      {error ? <Text className="text-xs text-red-600">{error}</Text> : null}
    </View>
  );
}
