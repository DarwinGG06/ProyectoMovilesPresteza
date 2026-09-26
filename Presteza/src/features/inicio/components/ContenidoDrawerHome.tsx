import { type ComponentProps, useEffect, useRef } from 'react';
import { DrawerContentScrollView, useDrawerStatus, type DrawerContentComponentProps } from 'expo-router/drawer';
import { Animated, Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSession } from '@/session/context';
import { IconoNav } from '@/shared/components/nav-bar/IconoNav';
import { SelloP } from '@/shared/components/nav-bar/SelloP';

import { useControlDrawerHome } from '../context/ControlDrawerHome';

const usarNativo = Platform.OS !== 'web';

type NombreIcono = ComponentProps<typeof IconoNav>['name'];

type EnlaceDrawer = {
  etiqueta: string;
  ruta: string;
  icono: NombreIcono;
  numero: string;
};

const ENLACES: EnlaceDrawer[] = [
  { etiqueta: 'Inicio', ruta: 'index', icono: 'home-outline', numero: '01' },
  { etiqueta: 'Menú', ruta: 'menu', icono: 'restaurant-outline', numero: '02' },
  { etiqueta: 'Nuestra Sede', ruta: 'sede', icono: 'location-outline', numero: '03' },
  { etiqueta: 'Nosotros', ruta: 'nosotros', icono: 'heart-outline', numero: '04' },
  { etiqueta: 'Contacto', ruta: 'contacto', icono: 'chatbubble-ellipses-outline', numero: '05' },
  { etiqueta: 'Reservas', ruta: 'reservas', icono: 'calendar-outline', numero: '06' },
];

export function ContenidoDrawerHome(props: DrawerContentComponentProps) {
  const { user } = useSession();
  const { registrar } = useControlDrawerHome();
  const insets = useSafeAreaInsets();
  const rutaActiva = props.state.routes[props.state.index]?.name;
  const abierto = useDrawerStatus() === 'open';

  const enlaces =
    user?.role === 'admin'
      ? [
          ...ENLACES,
          {
            etiqueta: 'Administración',
            ruta: 'administracion',
            icono: 'speedometer-outline' as NombreIcono,
            numero: '07',
          },
        ]
      : ENLACES;

  useEffect(() => {
    registrar({
      abrir: () => props.navigation.openDrawer(),
      cerrar: () => props.navigation.closeDrawer(),
      alternar: () => props.navigation.toggleDrawer(),
    });
    return () => registrar(null);
  }, [props.navigation, registrar]);

  return (
    <View className="flex-1 bg-marca-oscura">
      <View className="absolute -right-20 top-16 h-64 w-64 rounded-full border-[36px] border-oro/10" />
      <View className="absolute -left-12 bottom-20 h-48 w-48 rounded-full bg-marca/50" />
      <View className="absolute bottom-0 left-0 right-0 h-24 bg-oro/5" />

      <DrawerContentScrollView
        {...props}
        style={{ backgroundColor: 'transparent', flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 24,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}>
        <View className="flex-row items-center justify-between px-6">
          <SelloP size="md" />
          <Pressable
            onPress={() => props.navigation.closeDrawer()}
            className="h-12 w-12 items-center justify-center rounded-full border border-oro/50">
            <IconoNav name="close" size={22} className="text-oro" />
          </Pressable>
        </View>

        <View className="mb-6 mt-7 px-6">
          <Text className="text-[11px] tracking-[4px] text-oro">CARTA DE NAVEGACIÓN</Text>
          <Text className="mt-1 text-4xl font-extrabold tracking-[6px] text-crema">PRESTEZA</Text>
          <View className="mt-3 h-px w-24 bg-oro" />
          <Text className="mt-3 text-sm font-light text-crema/55">Elige el siguiente servicio de la casa.</Text>
        </View>

        <View className="px-3">
          {enlaces.map((enlace, index) => (
            <EnlaceDrawer
              key={enlace.ruta}
              visible={abierto}
              delay={index * 60}
              activo={rutaActiva === enlace.ruta}
              numero={enlace.numero}
              etiqueta={enlace.etiqueta}
              icono={enlace.icono}
              onPress={() => {
                props.navigation.navigate(enlace.ruta);
                props.navigation.closeDrawer();
              }}
            />
          ))}
        </View>

        <Text className="mt-auto px-6 pt-10 text-center text-[11px] tracking-[3px] text-oro/70">
          COMIDA PARA TODOS · MANIZALES
        </Text>
      </DrawerContentScrollView>
    </View>
  );
}

function EnlaceDrawer({
  visible,
  delay,
  activo,
  numero,
  etiqueta,
  icono,
  onPress,
}: {
  visible: boolean;
  delay: number;
  activo: boolean;
  numero: string;
  etiqueta: string;
  icono: NombreIcono;
  onPress: () => void;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 380, delay, useNativeDriver: usarNativo }),
        Animated.timing(translateX, { toValue: 0, duration: 380, delay, useNativeDriver: usarNativo }),
      ]).start();
    } else {
      opacity.setValue(0);
      translateX.setValue(20);
    }
  }, [delay, opacity, translateX, visible]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateX }] }}>
      <Pressable
        onPress={onPress}
        className={`mb-1 flex-row items-center rounded-sm px-3 py-3.5 ${activo ? 'bg-oro/10' : ''}`}>
        <View className={`mr-1 h-8 w-[3px] rounded-full ${activo ? 'bg-oro' : 'bg-transparent'}`} />
        <Text className={`w-10 text-xs font-bold tracking-widest ${activo ? 'text-oro' : 'text-oro/70'}`}>
          {numero}
        </Text>
        <Text
          className={`flex-1 text-[24px] tracking-wide ${activo ? 'font-medium text-oro' : 'font-light text-crema'}`}>
          {etiqueta}
        </Text>
        <IconoNav name={icono} size={18} className={activo ? 'text-oro' : 'text-oro/70'} />
      </Pressable>
      <View className="ml-12 h-px bg-oro/15" />
    </Animated.View>
  );
}
