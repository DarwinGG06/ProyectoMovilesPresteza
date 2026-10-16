import { View } from 'react-native';

import Field from '@/components/Field';
import { useFormulario } from '@/shared/hooks/useFormulario';
import type { MensajeForm } from '../../types';
import { AccionesForm } from './AccionesForm';

export function FormularioMensaje({
  valores,
  onGuardar,
  guardando,
}: {
  valores: MensajeForm;
  onCancelar: () => void;
  onGuardar: (datos: MensajeForm) => Promise<void>;
  guardando?: boolean;
}) {
  const { control, guardar } = useFormulario(valores, onGuardar);

  return (
    <View className="gap-5">
      <Field
        control={control}
        name="name"
        label="Nombre"
        autoCapitalize="words"
        variante="linea"
        rules={{ required: 'Escribe el nombre' }}
      />
      <Field
        control={control}
        name="email"
        label="Correo"
        keyboardType="email-address"
        variante="linea"
        rules={{ required: 'Escribe el correo' }}
      />
      <Field
        control={control}
        name="phone"
        label="Teléfono"
        keyboardType="phone-pad"
        variante="linea"
        rules={{ required: 'Escribe el teléfono' }}
      />
      <Field
        control={control}
        name="subject"
        label="Asunto"
        variante="linea"
        rules={{ required: 'Escribe el asunto' }}
      />
      <Field
        control={control}
        name="message"
        label="Mensaje"
        multiline
        variante="linea"
        rules={{ required: 'Escribe el mensaje' }}
      />
      <AccionesForm onGuardar={guardar} guardando={guardando} />
    </View>
  );
}
