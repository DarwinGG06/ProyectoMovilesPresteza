import { useForm } from 'react-hook-form';
import { Text, View } from 'react-native';

import Field from '@/components/Field';
import Select from '@/components/Select';
import type { DireccionForm } from '../../types';
import { AccionesFormulario } from '../elementos';

type FormularioDireccionProps = {
  valores?: DireccionForm;
  onCancelar: () => void;
  onGuardar: (datos: DireccionForm) => Promise<void>;
  guardando?: boolean;
};

export function FormularioDireccion({
  valores,
  onCancelar,
  onGuardar,
  guardando,
}: FormularioDireccionProps) {
  const { control, handleSubmit } = useForm<DireccionForm>({
    defaultValues: valores ?? {
      name: '',
      address: '',
      neighborhood: '',
      is_primary: false,
    },
  });

  return (
    <View className="gap-4">
      <Field
        control={control}
        name="name"
        label="Nombre de la dirección"
        placeholder="Casa, Trabajo..."
        autoCapitalize="words"
        maxLength={40}
        rules={{
          required: 'Escribe un nombre',
          maxLength: { value: 40, message: 'Máximo 40 caracteres' },
        }}
      />
      <Field
        control={control}
        name="address"
        label="Dirección"
        placeholder="Calle y número"
        autoCapitalize="sentences"
        maxLength={120}
        rules={{
          required: 'Escribe la dirección',
          maxLength: { value: 120, message: 'Máximo 120 caracteres' },
        }}
      />
      <Field
        control={control}
        name="neighborhood"
        label="Barrio"
        placeholder="Ej: Milán, Palogrande"
        autoCapitalize="words"
        maxLength={60}
        rules={{
          required: 'Escribe el barrio',
          maxLength: { value: 60, message: 'Máximo 60 caracteres' },
        }}
      />

      <View className="gap-1.5">
        <Text className="font-roboto-semibold text-marca-oscura">Ciudad</Text>
        <Text className="border border-linea bg-white p-3.5 font-roboto text-marca-oscura">
          Manizales
        </Text>
      </View>
      <View className="gap-1.5">
        <Text className="font-roboto-semibold text-marca-oscura">Código postal</Text>
        <Text className="border border-linea bg-white p-3.5 font-roboto text-marca-oscura">
          170001
        </Text>
      </View>

      <Select
        control={control}
        name="is_primary"
        label="Dirección principal"
        options={[
          { value: true, label: 'Sí' },
          { value: false, label: 'No' },
        ]}
      />

      <AccionesFormulario
        onCancelar={onCancelar}
        onGuardar={handleSubmit(onGuardar)}
        guardando={guardando}
      />
    </View>
  );
}
