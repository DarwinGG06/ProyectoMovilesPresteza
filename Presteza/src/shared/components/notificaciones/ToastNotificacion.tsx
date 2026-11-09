import { Href, router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconoNav } from '@/shared/components/nav-bar/IconoNav';
import { useNotificaciones } from '@/shared/notificaciones/NotificacionesProvider';
import { colores } from '@/theme/tokens';

import { iconoDeKind, selloDeKind } from './estiloNotificacion';

export function ToastNotificacion() {
  const tab = useNotificaciones();
  const insets = useSafeAreaInsets();
  const aviso = tab.toast;
  const entrada = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!aviso || tab.abierta) {
      entrada.setValue(0);
      return;
    }
    entrada.setValue(0);
    Animated.spring(entrada, {
      toValue: 1,
      friction: 8,
      tension: 68,
      useNativeDriver: true,
    }).start();
  }, [aviso, entrada, tab.abierta]);

  if (!aviso || tab.abierta) return null;

  const abrir = () => {
    void tab.leer(aviso.id);
    tab.cerrarToast();
    if (aviso.href) {
      router.push(aviso.href as Href);
      return;
    }
    tab.abrir();
  };

  return (
    <View
      pointerEvents="box-none"
      style={{ paddingTop: insets.top + 10 }}
      className="absolute left-0 right-0 top-0 z-[80] px-4">
      <Animated.View
        style={{
          opacity: entrada,
          transform: [
            {
              translateY: entrada.interpolate({
                inputRange: [0, 1],
                outputRange: [-28, 0],
              }),
            },
          ],
          shadowColor: colores['marca-oscura'],
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.28,
          shadowRadius: 18,
          elevation: 10,
        }}>
        <Pressable
          onPress={abrir}
          className="overflow-hidden border border-oro bg-marca-oscura">
          <View className="h-1 w-full bg-oro" />
          <View className="flex-row items-center gap-3 px-4 py-3.5">
            <View className="h-12 w-12 items-center justify-center border border-oro/80 bg-marca">
              <IconoNav name={iconoDeKind(aviso.kind)} size={20} color={colores.oro} />
            </View>
            <View className="flex-1">
              <Text className="font-roboto text-[10px] tracking-[3px] text-oro">
                PRESTEZA · {selloDeKind(aviso.kind)}
              </Text>
              <Text className="mt-1 font-serif text-[19px] leading-6 text-crema" numberOfLines={1}>
                {aviso.title}
              </Text>
              <Text className="mt-1 font-roboto text-xs leading-5 text-crema/75" numberOfLines={2}>
                {aviso.body}
              </Text>
            </View>
            <Pressable
              onPress={tab.cerrarToast}
              hitSlop={12}
              accessibilityLabel="Cerrar aviso"
              className="min-h-10 min-w-10 items-center justify-center">
              <IconoNav name="close" size={16} color={colores.oro} />
            </Pressable>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}
