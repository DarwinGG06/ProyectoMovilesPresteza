import { useState } from 'react';
import { Platform, Text, View } from 'react-native';

import Button from '@/components/Button';
import { Pergamino } from '@/shared/components/materiales/Pergamino';

import { useSession } from './context';

export function BiometricSettings() {
  const { biometricEnabled, biometricSupport, biometricBusy, setBiometricEnabled } = useSession();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggle = async () => {
    setMessage(null);
    setError(null);
    try {
      await setBiometricEnabled(!biometricEnabled);
      setMessage(
        biometricEnabled
          ? 'Desbloqueo biométrico desactivado.'
          : 'Acceso guardado en este teléfono. Podrás ingresar con biometría incluso después de cerrar sesión, mientras la sesión guardada siga vigente.'
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cambiar el desbloqueo.');
    }
  };

  if (Platform.OS !== 'android') return null;

  return (
    <View className="mb-3 overflow-hidden rounded-[28px]">
      <Pergamino>
        <View className="gap-4 px-5 py-5">
          <View className="gap-2">
            <Text className="font-roboto text-[10px] tracking-[2px] text-marca">
              {biometricEnabled ? 'ACCESO PROTEGIDO' : 'SEGURIDAD DEL DISPOSITIVO'}
            </Text>
            <Text accessibilityRole="header" className="font-serif-light text-[30px] text-tinta">
              {biometricSupport.label}
            </Text>
            <View className="h-px bg-madera/20" />
          </View>
          <Text className="font-roboto-light text-sm leading-6 text-tinta">
            {biometricEnabled
              ? 'Activado. Puedes volver a ingresar con biometría después de cerrar sesión. Para quitar el acceso guardado de este teléfono, desactívalo aquí.'
              : 'Protege el acceso a tu cuenta al abrir la app o volver del segundo plano. También puedes usar el código del teléfono o tu contraseña de Presteza.'}
          </Text>
          <Text className="font-roboto text-xs leading-5 text-madera">
            Tu huella permanece en el teléfono. Presteza no la recibe ni la guarda.
          </Text>
          {!biometricSupport.available ? (
            <Text className="font-roboto text-sm leading-5 text-marca">
              {biometricSupport.reason}
            </Text>
          ) : null}

          <Button
            variant={biometricEnabled ? 'secondary' : 'gold'}
            disabled={biometricBusy}
            onPress={() => void toggle()}
            text={
              biometricBusy
                ? 'VERIFICANDO...'
                : biometricEnabled
                  ? 'DESACTIVAR DESBLOQUEO'
                  : 'ACTIVAR HUELLA'
            }
          />
          {error || message ? (
            <Text
              accessibilityRole="alert"
              className={`font-roboto text-sm leading-5 ${error ? 'text-red-700' : 'text-marca'}`}>
              {error || message}
            </Text>
          ) : null}
        </View>
      </Pergamino>
    </View>
  );
}
