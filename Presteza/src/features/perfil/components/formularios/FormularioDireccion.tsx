import { useForm } from 'react-hook-form';
import { Text, View } from 'react-native';

import Field from '../../../../../components/Field';
import type { DireccionForm } from '../../types';
import { AccionesFormulario, ChipOpcion } from '../elementos';

type FormularioDireccionProps = {
  valores?: DireccionForm;
  onCancelar: () => void;
  onGuardar: (datos: DireccionForm) => Promise<void>;
  guardando?: boolean;
};

export function FormularioDireccion({ valores, onCancelar, onGuardar, guardando }: FormularioDireccionProps) {
  const { control, handleSubmit, watch, setValue } = useForm<DireccionForm>({
    defaultValues: valores ?? {
      name: '',
      address: '',
      neighborhood: '',
      is_primary: false,
    },
  });

  const esPrincipal = watch('is_primary');

  return (
    <View className="gap-4">
      <Field
        control={control}
        name="name"
        label="Nombre de la dirección"
        placeholder="Casa, Trabajo..."
        autoCapitalize="words"
        rules={{ required: 'Escribe un nombre' }}
      />
      <Field
        control={control}
        name="address"
        label="Dirección"
        placeholder="Calle y número"
        autoCapitalize="sentences"
        rules={{ required: 'Escribe la dirección' }}
      />
      <Field
        control={control}
        name="neighborhood"
        label="Barrio"
        placeholder="Ej: Milán, Palogrande"
        autoCapitalize="words"
        rules={{ required: 'Escribe el barrio' }}
      />

      <View className="gap-1">
        <Text className="font-semibold">Ciudad</Text>
        <Text className="border border-neutral-300 bg-white p-3 text-marca-oscura">Manizales</Text>
      </View>
      <View className="gap-1">
        <Text className="font-semibold">Código postal</Text>
        <Text className="border border-neutral-300 bg-white p-3 text-marca-oscura">170001</Text>
      </View>

      <View className="gap-2">
        <Text className="font-semibold">Dirección principal</Text>
        <View className="flex-row gap-2">
          <ChipOpcion etiqueta="Sí" activo={esPrincipal} onPress={() => setValue('is_primary', true)} />
          <ChipOpcion etiqueta="No" activo={!esPrincipal} onPress={() => setValue('is_primary', false)} />
        </View>
      </View>

      <AccionesFormulario
        onCancelar={onCancelar}
        onGuardar={handleSubmit(onGuardar)}
        guardando={guardando}
      />
    </View>
  );
}
