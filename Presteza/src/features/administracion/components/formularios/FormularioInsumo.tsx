import { View } from 'react-native';

import Field from '@/components/Field';
import { useFormulario } from '@/shared/hooks/useFormulario';
import type { InsumoForm } from '../../types';
import { AccionesForm } from './AccionesForm';
import { CampoStepper } from './CampoStepper';

export function FormularioInsumo({
  valores,
  onCancelar: _onCancelar,
  onGuardar,
  guardando,
}: {
  valores: InsumoForm;
  onCancelar: () => void;
  onGuardar: (datos: InsumoForm) => Promise<void>;
  guardando?: boolean;
}) {
  const { control, guardar } = useFormulario(valores, onGuardar);

  return (
    <View className="gap-5">
      <Field
        control={control}
        name="name"
        label="Nombre"
        placeholder="Sal, aceite…"
        autoCapitalize="words"
        variante="linea"
        rules={{ required: 'Escribe el nombre' }}
      />
      <Field
        control={control}
        name="description"
        label="Descripción"
        placeholder="Detalle del insumo"
        variante="linea"
        rules={{ required: 'Escribe una descripción' }}
      />
      <Field
        control={control}
        name="unit_price"
        label="Precio"
        placeholder="0"
        keyboardType="numeric"
        variante="linea"
        rules={{ required: 'Escribe el precio' }}
      />
      <CampoStepper control={control} name="quantity" label="Cantidad" minimo={0} />
      <AccionesForm onGuardar={guardar} guardando={guardando} />
    </View>
  );
}
