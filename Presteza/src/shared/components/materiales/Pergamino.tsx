import { type ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

/** Folio de marfil. Sin marco: el papel es la superficie. */
export function Pergamino({ children, fill }: { children: ReactNode; fill?: boolean }) {
  return (
    <LinearGradient
      colors={['#f7f3eb', '#f3ebe0', '#efe6d6']}
      locations={[0, 0.55, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{ flex: fill ? 1 : undefined }}>
      {children}
    </LinearGradient>
  );
}
