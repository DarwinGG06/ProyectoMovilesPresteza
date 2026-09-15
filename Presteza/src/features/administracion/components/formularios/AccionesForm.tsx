import { View } from 'react-native';

import Button from '@/components/Button';

export function AccionesForm({
  onCancelar,
  onGuardar,
  guardando,
  etiqueta = 'GUARDAR',
}: {
  onCancelar?: () => void;
  onGuardar: () => void;
  guardando?: boolean;
  etiqueta?: string;
}) {
  return (
    <View className="mt-5 gap-2">
      <Button text={guardando ? 'GUARDANDO…' : etiqueta} onPress={onGuardar} disabled={guardando} />
      {onCancelar ? <Button text="CANCELAR" onPress={onCancelar} secondary /> : null}
    </View>
  );
}
