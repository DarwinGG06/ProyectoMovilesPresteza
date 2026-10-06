import { type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type EvitarTecladoProps = {
  children: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  /** En modales no hay barra de navegación: usa 0. */
  offset?: number;
};

const COMPORTAMIENTO = Platform.OS === 'ios' ? 'padding' : 'height';

export function EvitarTeclado({ children, className, style, offset }: EvitarTecladoProps) {
  const insets = useSafeAreaInsets();
  const desplazamiento =
    offset ?? (Platform.OS === 'ios' ? insets.top + 72 : 0);

  return (
    <KeyboardAvoidingView
      className={className}
      style={[{ flex: 1 }, style]}
      behavior={Platform.OS === 'web' ? undefined : COMPORTAMIENTO}
      keyboardVerticalOffset={desplazamiento}
      enabled={Platform.OS !== 'web'}>
      {children}
    </KeyboardAvoidingView>
  );
}
