import { View } from 'react-native';

import Field from '@/components/Field';
import { useFormulario } from '@/shared/hooks/useFormulario';
import type { MensajeForm } from '../../types';
import { AccionesForm } from './AccionesForm';

export function FormularioMensaje({
  valores,
  onCancelar,
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
    <View className="gap-4">
      <Field
        control={control}
        name="name"
        label="Nombre"
        autoCapitalize="words"
        rules={{ required: 'Escribe el nombre' }}
      />
      <Field control={control} name="email" label="Correo" keyboardType="email-address" rules={{ required: 'Escribe el correo' }} />
      <Field control={control} name="phone" label="Teléfono" keyboardType="phone-pad" rules={{ required: 'Escribe el teléfono' }} />
      <Field control={control} name="subject" label="Asunto" rules={{ required: 'Escribe el asunto' }} />
      <Field
        control={control}
        name="message"
        label="Mensaje"
        multiline
        rules={{ required: 'Escribe el mensaje' }}
      />
      <AccionesForm onCancelar={onCancelar} onGuardar={guardar} guardando={guardando} />
    </View>
  );
}
