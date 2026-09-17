import { useForm } from 'react-hook-form';
import { View } from 'react-native';

import Field from '@/components/Field';
import Select from '@/components/Select';
import type { MesaAdmin, ReservaFormAdmin } from '../../types';
import { AccionesForm } from './AccionesForm';

export function FormularioReservaAdmin({
  valores,
  mesas,
  onCancelar,
  onGuardar,
  guardando,
}: {
  valores: ReservaFormAdmin;
  mesas: MesaAdmin[];
  onCancelar: () => void;
  onGuardar: (datos: ReservaFormAdmin) => Promise<void>;
  guardando?: boolean;
}) {
  const { control, handleSubmit } = useForm<ReservaFormAdmin>({ defaultValues: valores });
  const mesasActivas = mesas.filter((item) => item.active !== false);

  return (
    <View className="gap-4">
      {mesasActivas.length > 0 ? (
        <Select
          control={control}
          name="tableNumber"
          label="Mesa"
          options={mesasActivas.map((item) => ({
            value: item.number,
            label: `${item.number} · ${item.capacity}`,
          }))}
          rules={{ required: 'Elige la mesa' }}
        />
      ) : (
        <Field
          control={control}
          name="tableNumber"
          label="Mesa"
          placeholder="T1"
          rules={{ required: 'Elige la mesa' }}
        />
      )}
      <Field
        control={control}
        name="date"
        label="Fecha"
        placeholder="DD/MM/AAAA"
        rules={{
          required: 'Escribe la fecha',
          pattern: { value: /^\d{2}\/\d{2}\/\d{4}$/, message: 'Usa DD/MM/AAAA' },
        }}
      />
      <Field control={control} name="time" label="Hora" placeholder="7:30 p. m." rules={{ required: 'Escribe la hora' }} />
      <Field
        control={control}
        name="numberOfPeople"
        label="Personas"
        keyboardType="number-pad"
        rules={{
          required: 'Indica cuántas personas',
          validate: (valor) => {
            const numero = Number(valor);
            if (!numero || numero < 1) return 'Mínimo 1 persona';
            if (numero > 20) return 'Máximo 20 personas';
            return true;
          },
        }}
      />
      <Field control={control} name="specialRequests" label="Notas" placeholder="Opcional" autoCapitalize="sentences" />
      <AccionesForm onCancelar={onCancelar} onGuardar={handleSubmit(onGuardar)} guardando={guardando} />
    </View>
  );
}
