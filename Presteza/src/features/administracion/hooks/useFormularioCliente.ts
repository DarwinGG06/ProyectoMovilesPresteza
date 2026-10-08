import { useFormulario } from '@/shared/hooks/useFormulario';

import type { ClienteForm } from '../types';

type Formulario = ClienteForm & { confirmation: string };

export function useFormularioCliente(
  valores: ClienteForm,
  onGuardar: (datos: ClienteForm) => Promise<void>,
) {
  const { control, handleSubmit, getValues } = useFormulario<Formulario>({
    ...valores,
    confirmation: '',
  });

  const enviar = handleSubmit(({ confirmation: _omitida, ...datos }) => onGuardar(datos));

  return { control, enviar, getValues };
}
