import { useForm, type DefaultValues, type FieldValues, type SubmitHandler } from 'react-hook-form';

/** `react-hook-form` vive en el hook, no en el componente de UI. */
export function useFormulario<T extends FieldValues>(
  valores: DefaultValues<T>,
  onGuardar?: SubmitHandler<T>,
) {
  const form = useForm<T>({ defaultValues: valores });
  return {
    control: form.control,
    getValues: form.getValues,
    setValue: form.setValue,
    watch: form.watch,
    reset: form.reset,
    setError: form.setError,
    formState: form.formState,
    handleSubmit: form.handleSubmit,
    guardar: onGuardar ? form.handleSubmit(onGuardar) : form.handleSubmit(() => undefined),
  };
}
