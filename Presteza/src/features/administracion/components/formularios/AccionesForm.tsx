import Button from '@/components/Button';

export function AccionesForm({
  onGuardar,
  guardando,
  etiqueta = 'LISTO',
}: {
  onCancelar?: () => void;
  onGuardar: () => void;
  guardando?: boolean;
  etiqueta?: string;
}) {
  return (
    <Button
      text={guardando ? 'GUARDANDO' : etiqueta}
      variant="gold"
      compact
      disabled={guardando}
      className="mt-4 w-full"
      onPress={onGuardar}
    />
  );
}
