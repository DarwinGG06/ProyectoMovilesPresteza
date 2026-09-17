import React from 'react';
import { Text } from 'react-native';

type Props = {
  text: string;
  /** `pill` = chip de marca. `sello` = etiqueta en oro, sin fondo. */
  variant?: 'pill' | 'sello';
  className?: string;
};

export default function Badge({ text, variant = 'pill', className }: Props) {
  const clases =
    variant === 'sello'
      ? 'text-[11px] font-semibold tracking-[3px] text-oro'
      : 'self-start rounded-full bg-marca/10 px-3 py-1 text-[11px] font-semibold tracking-[2px] text-marca';

  return <Text className={`${clases} ${className ?? ''}`}>{text}</Text>;
}
