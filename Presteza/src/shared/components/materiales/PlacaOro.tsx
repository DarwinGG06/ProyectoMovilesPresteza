import { type ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

/** Champán, un solo plano. Sin filetes ni brillo extra. */
export function PlacaOro({
  children,
  compact,
}: {
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <LinearGradient
      colors={['#e8d4a4', '#d4af77', '#c4a05e']}
      locations={[0, 0.5, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: compact ? 8 : 12,
      }}>
      {children}
    </LinearGradient>
  );
}
