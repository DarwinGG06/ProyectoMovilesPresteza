import React from 'react';
import { Pressable, Text } from 'react-native';

type Variant = 'primary' | 'secondary' | 'ghost' | 'gold';

interface Props {
  text: string;
  onPress: () => void;
  /** Se ve apagado y deja de responder. Útil mientras se envía un formulario. */
  disabled?: boolean;
  /**
   * `primary` fondo marca oscura (formularios).
   * `secondary` borde oro sobre fondo claro.
   * `ghost` borde oro sobre fondo oscuro.
   * `gold` fondo oro.
   */
  variant?: Variant;
  /** Alias de `variant="secondary"`. */
  secondary?: boolean;
  className?: string;
}

export default function Button({ text, onPress, disabled, variant, secondary, className }: Props) {
  const tono: Variant = variant ?? (secondary ? 'secondary' : 'primary');

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`items-center py-4 active:opacity-80 disabled:opacity-50 ${
        tono === 'secondary'
          ? 'border border-oro bg-transparent'
          : tono === 'ghost'
            ? 'border border-oro bg-transparent'
            : tono === 'gold'
              ? 'bg-oro'
              : 'bg-marca-oscura'
      } ${className ?? ''}`}>
      <Text
        className={`text-center text-[11px] tracking-[3px] ${
          tono === 'ghost' ? 'text-oro' : tono === 'primary' ? 'text-crema' : 'text-marca-oscura'
        }`}>
        {text}
      </Text>
    </Pressable>
  );
}
