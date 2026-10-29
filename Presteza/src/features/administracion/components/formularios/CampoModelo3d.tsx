import { Pressable, Text, View } from 'react-native';

import { IconoNav } from '@/shared/components/nav-bar/IconoNav';

function BotonModelo({
  etiqueta,
  onPress,
  disabled,
  peligro,
}: {
  etiqueta: string;
  onPress: () => void;
  disabled?: boolean;
  peligro?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`min-w-[30%] flex-1 border py-3 active:opacity-80 disabled:opacity-50 ${
        peligro ? 'border-red-600/60' : 'border-oro'
      }`}>
      <Text
        className={`text-center font-roboto text-[10px] tracking-[2px] ${
          peligro ? 'text-red-600' : 'text-marca-oscura'
        }`}>
        {etiqueta}
      </Text>
    </Pressable>
  );
}

type CampoModelo3dProps = {
  /** Nombre del archivo elegido o guardado; `null` si el plato no tiene modelo. */
  nombre: string | null;
  /** El archivo está elegido pero todavía no se ha subido. */
  pendiente: boolean;
  error?: string;
  disabled?: boolean;
  onElegir: () => void;
  onVer: () => void;
  onQuitar: () => void;
};

export function CampoModelo3d({
  nombre,
  pendiente,
  error,
  disabled,
  onElegir,
  onVer,
  onQuitar,
}: CampoModelo3dProps) {
  return (
    <View className="gap-1.5">
      <Text className="font-roboto-semibold text-marca-oscura">Modelo 3D (opcional)</Text>
      <View
        className={`flex-row items-center gap-3 border bg-white px-4 py-4 ${
          error ? 'border-red-600' : 'border-linea'
        }`}>
        <IconoNav name="cube-outline" size={26} className="text-marca" />
        <View className="flex-1">
          {nombre ? (
            <>
              <Text className="font-roboto text-sm text-marca-oscura" numberOfLines={1}>
                {nombre}
              </Text>
              <Text className="mt-0.5 font-roboto text-[10px] tracking-[1px] text-texto/70">
                {pendiente ? 'SE SUBIRÁ AL GUARDAR' : 'GUARDADO'}
              </Text>
            </>
          ) : (
            <Text className="font-roboto text-[10px] tracking-[2px] text-texto/70">SIN MODELO</Text>
          )}
        </View>
      </View>
      <View className="mt-1 flex-row flex-wrap gap-2">
        <BotonModelo
          etiqueta={nombre ? 'CAMBIAR' : 'ELEGIR .GLB'}
          onPress={onElegir}
          disabled={disabled}
        />
        {nombre ? <BotonModelo etiqueta="VER" onPress={onVer} disabled={disabled} /> : null}
        {nombre ? (
          <BotonModelo etiqueta="QUITAR" onPress={onQuitar} disabled={disabled} peligro />
        ) : null}
      </View>
      <Text className="font-roboto text-xs text-texto/70">
        Archivo .glb. Máximo 10 MB. Es lo que se ve al tocar el cubo en el menú.
      </Text>
      {error ? <Text className="font-roboto text-xs text-red-600">{error}</Text> : null}
    </View>
  );
}
