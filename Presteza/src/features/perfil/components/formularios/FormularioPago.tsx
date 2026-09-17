import { useForm } from 'react-hook-form';
import { View } from 'react-native';

import Field from '@/components/Field';
import Select from '@/components/Select';
import type { TarjetaForm } from '../../types';
import { AccionesFormulario } from '../elementos';

const MARCAS = ['Visa', 'Mastercard', 'American Express', 'Diners Club'];

type FormularioPagoProps = {
  onCancelar: () => void;
  onGuardar: (datos: TarjetaForm) => Promise<void>;
  guardando?: boolean;
};

export function FormularioPago({ onCancelar, onGuardar, guardando }: FormularioPagoProps) {
  const { control, handleSubmit } = useForm<TarjetaForm>({
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

  return (
    <View className="gap-4">
      <Field
        control={control}
        name="name"
        label="Nombre de la tarjeta"
        placeholder="Ej: Tarjeta personal"
        autoCapitalize="words"
        maxLength={40}
        rules={{
          required: 'Escribe un nombre',
          maxLength: { value: 40, message: 'Máximo 40 caracteres' },
        }}
      />
      <Field
        control={control}
        name="cardholder_name"
        label="Titular"
        placeholder="Nombre como aparece en la tarjeta"
        autoCapitalize="words"
        maxLength={80}
        rules={{
          required: 'Escribe el titular',
          maxLength: { value: 80, message: 'Máximo 80 caracteres' },
        }}
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

      <Select
        control={control}
        name="type"
        label="Tipo"
        options={[
          { value: 'credit', label: 'Crédito' },
          { value: 'debit', label: 'Débito' },
        ]}
        rules={{ required: 'Elige el tipo' }}
      />
      <Select control={control} name="brand" label="Marca" options={MARCAS} rules={{ required: 'Elige la marca' }} />
      <Select
        control={control}
        name="is_primary"
        label="Método principal"
        options={[
          { value: true, label: 'Sí' },
          { value: false, label: 'No' },
        ]}
      />

      <AccionesFormulario
        onCancelar={onCancelar}
        onGuardar={handleSubmit(onGuardar)}
        guardando={guardando}
        etiquetaGuardar="AGREGAR TARJETA"
      />
    </View>
  );
}
