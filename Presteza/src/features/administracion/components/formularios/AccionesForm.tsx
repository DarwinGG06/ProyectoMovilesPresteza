import { View } from 'react-native';

import { BotonPerfil } from '@/features/perfil/components/elementos';

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
      <BotonPerfil etiqueta={guardando ? 'GUARDANDO...' : etiqueta} onPress={onGuardar} disabled={guardando} />
      {onCancelar ? <BotonPerfil etiqueta="CANCELAR" onPress={onCancelar} variante="outline" /> : null}
    </View>
  );
}
