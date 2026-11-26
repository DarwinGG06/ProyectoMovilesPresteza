import { View } from 'react-native';

import Button from '@/components/Button';

export function AccionesForm({
  onCancelar,
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
    <View className="mt-3 gap-2">
      <Button
        text={guardando ? 'GUARDANDO' : etiqueta}
        variant="gold"
        compact
        disabled={guardando}
        className="w-full"
        onPress={onGuardar}
      />
      {onCancelar ? (
        <Button
          text="CANCELAR"
          secondary
          compact
          disabled={guardando}
          className="w-full"
          onPress={onCancelar}
        />
      ) : null}
    </View>
  );
}
