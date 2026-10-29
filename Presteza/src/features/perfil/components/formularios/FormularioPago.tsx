import { View } from 'react-native';

import Field from '@/components/Field';
import Select from '@/components/Select';
import { useFormulario } from '@/shared/hooks/useFormulario';
import type { TarjetaForm } from '../../types';
import { formatearVencimiento, vencimientoValido } from '../../utils';
import { AccionesFormulario } from '../elementos';

const MARCAS = ['Visa', 'Mastercard', 'American Express', 'Diners Club'];

type FormularioPagoProps = {
  /** Valores de la tarjeta que se edita. Sin valores = tarjeta nueva. */
  valores?: TarjetaForm;
  onCancelar: () => void;
  onGuardar: (datos: TarjetaForm) => Promise<void>;
  guardando?: boolean;
};

export function FormularioPago({ valores, onCancelar, onGuardar, guardando }: FormularioPagoProps) {
  const { control, guardar } = useFormulario<TarjetaForm>(
    valores ?? {
      name: '',
      cardholder_name: '',
      last_four_digits: '',
      type: 'credit',
      brand: 'Visa',
      expiry_date: '',
      is_primary: false,
    },
    onGuardar,
  );

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
        placeholder="MM/AAAA"
        keyboardType="number-pad"
        maxLength={7}
        formatear={formatearVencimiento}
        rules={{
          required: 'Escribe el vencimiento',
          pattern: { value: /^(0[1-9]|1[0-2])\/\d{4}$/, message: 'Usa el formato MM/AAAA' },
          validate: (valor) =>
            vencimientoValido(String(valor ?? '')) || 'La tarjeta está vencida o la fecha no es válida',
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
        onGuardar={guardar}
        guardando={guardando}
        etiquetaGuardar={valores ? 'GUARDAR CAMBIOS' : 'AGREGAR TARJETA'}
      />
    </View>
  );
}
