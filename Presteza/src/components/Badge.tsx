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
      ? 'font-roboto-semibold text-[11px] tracking-[3px] text-oro'
      : 'self-start rounded-full bg-marca/10 px-3 py-1 font-roboto-semibold text-[11px] tracking-[2px] text-marca';

  return <Text className={`${clases} ${className ?? ''}`}>{text}</Text>;
}
