import { View } from 'react-native';

import Field from '@/components/Field';
import Select from '@/components/Select';
import { useFormulario } from '@/shared/hooks/useFormulario';
import type { MesaAdmin, ReservaFormAdmin } from '../../types';
import { AccionesForm } from './AccionesForm';
import { CampoStepper } from './CampoStepper';

export function FormularioReservaAdmin({
  valores,
  mesas,
  onGuardar,
  guardando,
}: {
  valores: ReservaFormAdmin;
  mesas: MesaAdmin[];
  onCancelar: () => void;
  onGuardar: (datos: ReservaFormAdmin) => Promise<void>;
  guardando?: boolean;
}) {
  const { control, guardar } = useFormulario(valores, onGuardar);
  const mesasActivas = mesas.filter((item) => item.active !== false);

  return (
    <View className="gap-5">
      {mesasActivas.length > 0 ? (
        <Select
          control={control}
          name="tableNumber"
          label="Mesa"
          variante="fila"
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
          variante="linea"
          rules={{ required: 'Elige la mesa' }}
        />
      )}
      <Field
        control={control}
        name="date"
        label="Fecha"
        placeholder="DD/MM/AAAA"
        variante="linea"
        rules={{
          required: 'Escribe la fecha',
          pattern: { value: /^\d{2}\/\d{2}\/\d{4}$/, message: 'Usa DD/MM/AAAA' },
        }}
      />
      <Field
        control={control}
        name="time"
        label="Hora"
        placeholder="7:30 p. m."
        variante="linea"
        rules={{ required: 'Escribe la hora' }}
      />
      <CampoStepper control={control} name="numberOfPeople" label="Personas" minimo={1} maximo={20} />
      <Field
        control={control}
        name="specialRequests"
        label="Notas"
        placeholder="Opcional"
        autoCapitalize="sentences"
        variante="linea"
      />
      <AccionesForm onGuardar={guardar} guardando={guardando} />
    </View>
  );
}
