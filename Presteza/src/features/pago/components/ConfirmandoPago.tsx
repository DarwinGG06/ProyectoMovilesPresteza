import { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Modal, Text, View } from 'react-native';

/** Overlay quemado: simula cobro con tarjeta. Siempre termina bien. */
export function ConfirmandoPago({ visible }: { visible: boolean }) {
  const opacidad = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    if (!visible) {
      opacidad.setValue(0.45);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacidad, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacidad, { toValue: 0.45, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacidad, visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View className="flex-1 items-center justify-center bg-tinta/55 px-8">
        <View className="w-full max-w-sm border border-oro/50 bg-pergamino px-6 py-10">
          <ActivityIndicator color="#6b1d3d" size="large" />
          <Animated.Text
            style={{ opacity: opacidad }}
            className="mt-6 text-center font-roboto text-[12px] tracking-[3px] text-marca">
            CONFIRMANDO PAGO
          </Animated.Text>
          <Text className="mt-3 text-center font-serif-light text-2xl leading-8 text-tinta">
            Procesando tu tarjeta…
          </Text>
          <Text className="mt-3 text-center font-roboto text-sm leading-5 text-tinta/60">
            Un momento. No cierres la app.
          </Text>
        </View>
      </View>
    </Modal>
  );
}
