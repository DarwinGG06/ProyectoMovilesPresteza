import { useForm } from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';

import Field from '../../../../../components/Field';
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
  const { control, handleSubmit, setValue, watch } = useForm<ReservaFormAdmin>({ defaultValues: valores });
  const mesa = watch('tableNumber');

  return (
    <View className="gap-4">
      {mesas.length > 0 ? (
        <View>
          <Text className="mb-2 font-semibold">Mesa</Text>
          <View className="flex-row flex-wrap gap-2">
            {mesas
              .filter((item) => item.active !== false)
              .map((item) => {
                const activa = mesa === item.number;
                return (
                  <Pressable
                    key={item.number}
                    onPress={() => setValue('tableNumber', item.number)}
                    className={`px-3 py-2 ${activa ? 'bg-marca-oscura' : 'border border-marca/20'}`}>
                    <Text className={`text-[12px] ${activa ? 'text-crema' : 'text-marca-oscura'}`}>
                      {item.number} · {item.capacity}
                    </Text>
                  </Pressable>
                );
              })}
          </View>
        </View>
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
