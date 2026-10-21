import { View } from 'react-native';

import Field from '@/components/Field';
import { CampoFechaReserva } from '@/features/reservas/components/CampoFechaReserva';
import { CampoHoraReserva } from '@/features/reservas/components/CampoHoraReserva';
import { useFormulario } from '@/shared/hooks/useFormulario';
import type { ReservaForm } from '../../types';
import { AccionesFormulario } from '../elementos';

type FormularioReservaProps = {
  valores: ReservaForm;
  onCancelar: () => void;
  onGuardar: (datos: ReservaForm) => Promise<void>;
  guardando?: boolean;
};

export function FormularioReserva({ valores, onCancelar, onGuardar, guardando }: FormularioReservaProps) {
  const { control, guardar, watch } = useFormulario(valores, onGuardar);
  const fecha = watch('date');

  return (
    <View className="gap-4">
      <CampoFechaReserva control={control} name="date" />
      <CampoHoraReserva control={control} name="time" fecha={fecha} />
      <Field
        control={control}
        name="numberOfPeople"
        label="Número de personas"
        placeholder="Ej: 2"
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
      <Field
        control={control}
        name="specialRequests"
        label="Solicitudes especiales"
        placeholder="Opcional"
        autoCapitalize="sentences"
      />
      <AccionesFormulario
        onCancelar={onCancelar}
        onGuardar={guardar}
        guardando={guardando}
        etiquetaGuardar="GUARDAR RESERVA"
      />
    </View>
  );
}
