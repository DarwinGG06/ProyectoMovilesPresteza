import { View } from 'react-native';

import Field from '@/components/Field';
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
  const { control, guardar } = useFormulario(valores, onGuardar);

  return (
    <View className="gap-4">
      <Field
        control={control}
        name="date"
        label="Fecha"
        placeholder="DD/MM/AAAA"
        rules={{
          required: 'Escribe la fecha',
          pattern: { value: /^\d{2}\/\d{2}\/\d{4}$/, message: 'Usa el formato DD/MM/AAAA' },
        }}
      />
      <Field
        control={control}
        name="time"
        label="Hora"
        placeholder="Ej: 7:30 p. m."
        rules={{ required: 'Escribe la hora' }}
      />
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
