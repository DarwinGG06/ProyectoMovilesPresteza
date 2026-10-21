import Button from '@/components/Button';

/** CTA de la bandeja: misma placa de oro que el resto de botones dorados. */
export function SelloLacre({
  texto,
  onPress,
  disabled,
}: {
  texto: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return <Button text={texto} onPress={onPress} disabled={disabled} variant="gold" />;
}
