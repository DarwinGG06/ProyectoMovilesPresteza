import { Pressable, Text, View } from 'react-native';

export function AccionesForm({
  onGuardar,
  guardando,
  etiqueta = 'LISTO',
}: {
  onCancelar?: () => void;
  onGuardar: () => void;
  guardando?: boolean;
  etiqueta?: string;
}) {
  return (
    <Pressable
      onPress={onGuardar}
      disabled={guardando}
      className="mt-8 items-center py-2 active:opacity-60 disabled:opacity-40">
      <Text className="font-roboto text-[11px] tracking-[4px] text-marca-oscura">
        {guardando ? 'GUARDANDO' : etiqueta}
      </Text>
      <View className="mt-2 h-px w-12 bg-oro" />
    </Pressable>
  );
}
