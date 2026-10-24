import { View } from 'react-native';

import Field from '@/components/Field';
import Select from '@/components/Select';
import { useFormulario } from '@/shared/hooks/useFormulario';

import type { AdicionalForm, CategoriaAdmin } from '../../types';
import { idDe } from '../../utils';
import { AccionesForm } from './AccionesForm';

export function FormularioAdicional({
  valores,
  categorias,
  onGuardar,
  guardando,
}: {
  valores: AdicionalForm;
  categorias: CategoriaAdmin[];
  onCancelar: () => void;
  onGuardar: (datos: AdicionalForm) => Promise<void>;
  guardando?: boolean;
}) {
  const { control, guardar } = useFormulario(valores, onGuardar);

  return (
    <View className="gap-5">
      <Field
        control={control}
        name="name"
        label="Nombre"
        placeholder="Nombre"
        autoCapitalize="words"
        variante="linea"
        rules={{ required: 'Escribe el nombre' }}
      />
      <Field
        control={control}
        name="price"
        label="Precio"
        placeholder="0"
        keyboardType="numeric"
        variante="linea"
        rules={{ required: 'Escribe el precio' }}
      />
      <Select
        control={control}
        name="categoryIds"
        label="Categorías"
        multiple
        options={categorias.map((categoria) => ({ value: idDe(categoria), label: categoria.name }))}
        rules={{
          validate: (valor) =>
            (Array.isArray(valor) && valor.length > 0) || 'Elige al menos una categoría',
        }}
      />
      <AccionesForm onGuardar={guardar} guardando={guardando} />
    </View>
  );
}
