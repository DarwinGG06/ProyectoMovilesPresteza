import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { PlacaOro } from '@/shared/components/materiales/PlacaOro';

type Variant = 'primary' | 'secondary' | 'ghost' | 'gold';

interface Props {
  text: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: Variant;
  secondary?: boolean;
  compact?: boolean;
  className?: string;
}

export default function Button({
  text,
  onPress,
  disabled,
  variant,
  secondary,
  compact,
  className,
}: Props) {
  const tono: Variant = variant ?? (secondary ? 'secondary' : 'primary');
  const letra = compact ? 'text-[10px] tracking-[1.2px]' : 'text-[11px] tracking-[3px]';
  const alto = compact ? 48 : 54;

  if (disabled) {
    return (
      <Pressable
        disabled
        accessibilityRole="button"
        accessibilityState={{ disabled: true }}
        style={{ height: alto }}
        className={className}>
        <View className="h-full w-full items-center justify-center border border-dashed border-madera bg-pergamino-oscuro">
          <Text numberOfLines={1} className={`text-center font-roboto ${letra} text-tinta`}>
            {text}
          </Text>
        </View>
      </Pressable>
    );
  }

  if (tono === 'gold') {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ disabled: Boolean(disabled) }}
        style={{ height: alto }}
        className={`${className ?? ''}`}>
        <PlacaOro compact={compact}>
          <Text numberOfLines={1} className={`text-center font-roboto ${letra} text-marca-oscura`}>
            {text}
          </Text>
        </PlacaOro>
      </Pressable>
    );
  }

  const caja =
    tono === 'primary'
      ? 'bg-marca-oscura'
      : tono === 'ghost'
        ? 'border border-oro/50 bg-marca-oscura'
        : 'border border-marca-oscura/25 bg-pergamino';
  const texto =
    tono === 'ghost' ? 'text-oro' : tono === 'primary' ? 'text-crema' : 'text-marca-oscura';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      style={{ height: alto }}
      className={`${className ?? ''}`}>
      <View className={`h-full w-full items-center justify-center ${caja}`}>
        <Text numberOfLines={1} className={`text-center font-roboto ${letra} ${texto}`}>
          {text}
        </Text>
      </View>
    </Pressable>
  );
}
