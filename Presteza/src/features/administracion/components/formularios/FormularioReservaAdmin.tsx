import { View } from 'react-native';

import Button from '@/components/Button';
import Field from '@/components/Field';
import Select from '@/components/Select';
import { CampoFechaReserva } from '@/features/reservas/components/CampoFechaReserva';
import { CampoHoraReserva } from '@/features/reservas/components/CampoHoraReserva';
import { useFormulario } from '@/shared/hooks/useFormulario';
import type { MesaAdmin, ReservaFormAdmin } from '../../types';
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
  const { control, guardar, watch } = useFormulario(valores, onGuardar);
  const fecha = watch('date');
  const mesasActivas = mesas.filter((item) => item.active !== false);

  return (
    <View className="gap-3 pb-1">
      {mesasActivas.length > 0 ? (
        <Select
          control={control}
          name="tableNumber"
          label="Mesa"
          variante="chips"
          options={mesasActivas.map((item) => ({
            value: item.number,
            label: `${item.number} · ${item.capacity}p`,
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
      <CampoFechaReserva control={control} name="date" />
      <CampoHoraReserva control={control} name="time" fecha={fecha} />
      <CampoStepper control={control} name="numberOfPeople" label="Personas" minimo={1} maximo={20} />
      <Field
        control={control}
        name="specialRequests"
        label="Notas"
        placeholder="Opcional"
        autoCapitalize="sentences"
        variante="linea"
      />
      <Button
        text={guardando ? 'GUARDANDO' : 'LISTO'}
        variant="gold"
        compact
        disabled={guardando}
        className="mt-3 w-full"
        onPress={guardar}
      />
    </View>
  );
}
