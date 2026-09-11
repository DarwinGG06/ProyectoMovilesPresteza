import { useForm } from 'react-hook-form';
import { Text, View } from 'react-native';

import Field from '../../../../../components/Field';
import type { TarjetaForm } from '../../types';
import { AccionesFormulario, ChipOpcion } from '../elementos';

const MARCAS = ['Visa', 'Mastercard', 'American Express', 'Diners Club'];

type FormularioPagoProps = {
  onCancelar: () => void;
  onGuardar: (datos: TarjetaForm) => Promise<void>;
  guardando?: boolean;
};

export function FormularioPago({ onCancelar, onGuardar, guardando }: FormularioPagoProps) {
  const { control, handleSubmit, watch, setValue } = useForm<TarjetaForm>({
    defaultValues: {
      name: '',
      cardholder_name: '',
      last_four_digits: '',
      type: 'credit',
      brand: 'Visa',
      expiry_date: '',
      is_primary: false,
    },
  });

  const tipo = watch('type');
  const marca = watch('brand');
  const esPrincipal = watch('is_primary');

  return (
    <View className="gap-4">
      <Field
        control={control}
        name="name"
        label="Nombre de la tarjeta"
        placeholder="Ej: Tarjeta personal"
        autoCapitalize="words"
        rules={{ required: 'Escribe un nombre' }}
      />
      <Field
        control={control}
        name="cardholder_name"
        label="Titular"
        placeholder="Nombre como aparece en la tarjeta"
        autoCapitalize="words"
        rules={{ required: 'Escribe el titular' }}
      />
      <Field
        control={control}
        name="last_four_digits"
        label="Últimos 4 dígitos"
        placeholder="1234"
        keyboardType="number-pad"
        maxLength={4}
        rules={{
          required: 'Escribe los últimos 4 dígitos',
          pattern: { value: /^\d{4}$/, message: 'Deben ser 4 números' },
        }}
      />
      <Field
        control={control}
        name="expiry_date"
        label="Vencimiento"
        placeholder="MM/YY"
        maxLength={5}
        rules={{
          required: 'Escribe el vencimiento',
          pattern: { value: /^(0[1-9]|1[0-2])\/\d{2}$/, message: 'Usa el formato MM/YY' },
        }}
      />

      <View className="gap-2">
        <Text className="font-semibold">Tipo</Text>
        <View className="flex-row gap-2">
          <ChipOpcion etiqueta="Crédito" activo={tipo === 'credit'} onPress={() => setValue('type', 'credit')} />
          <ChipOpcion etiqueta="Débito" activo={tipo === 'debit'} onPress={() => setValue('type', 'debit')} />
        </View>
      </View>

      <View className="gap-2">
        <Text className="font-semibold">Marca</Text>
        <View className="flex-row flex-wrap gap-2">
          {MARCAS.map((opcion) => (
            <ChipOpcion
              key={opcion}
              etiqueta={opcion}
              activo={marca === opcion}
              onPress={() => setValue('brand', opcion)}
            />
          ))}
        </View>
      </View>

      <View className="gap-2">
        <Text className="font-semibold">Método principal</Text>
        <View className="flex-row gap-2">
          <ChipOpcion etiqueta="Sí" activo={esPrincipal} onPress={() => setValue('is_primary', true)} />
          <ChipOpcion etiqueta="No" activo={!esPrincipal} onPress={() => setValue('is_primary', false)} />
        </View>
      </View>

      <AccionesFormulario
        onCancelar={onCancelar}
        onGuardar={handleSubmit(onGuardar)}
        guardando={guardando}
        etiquetaGuardar="AGREGAR TARJETA"
      />
    </View>
  );
}
