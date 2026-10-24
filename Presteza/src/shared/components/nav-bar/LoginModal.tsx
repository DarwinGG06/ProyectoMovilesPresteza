import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import Button from '@/components/Button';
import Field from '@/components/Field';
import MensajeError from '@/components/MensajeError';
import { BiometricLoginButton } from '@/session/BiometricLoginButton';
import { EvitarTeclado } from '@/shared/components/evitar-teclado/EvitarTeclado';
import { Pergamino } from '@/shared/components/materiales/Pergamino';
import { useLoginModal } from '@/shared/hooks/useLoginModal';

import { IconoNav } from './IconoNav';
import { SelloP } from './SelloP';

type LoginModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function LoginModal({ visible, onClose }: LoginModalProps) {
  const {
    control,
    close,
    entrar,
    irARecuperar,
    irARegistro,
    error,
    enviando,
    entrarConBiometria,
    biometricSupport,
    biometricBusy,
    biometricEnabled,
  } = useLoginModal(onClose);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <EvitarTeclado offset={0}>
        <Pressable
          onPress={close}
          className="flex-1 items-center justify-center bg-marca-oscura/70 px-5">
          <Pressable onPress={() => {}} className="max-h-[95%] w-full overflow-hidden">
            <ScrollView keyboardShouldPersistTaps="handled">
              <Pergamino>
                <View className="p-6">
                  <Pressable
                    onPress={close}
                    className="absolute right-5 top-5 z-10 h-9 w-9 items-center justify-center border border-madera/25">
                    <IconoNav name="close" size={16} className="text-tinta" />
                  </Pressable>

                  <View className="mb-8 items-center pt-4">
                    <SelloP size="md" />
                    <Text className="mt-5 font-roboto text-[10px] tracking-[4px] text-marca">
                      INICIAR SESIÓN
                    </Text>
                    <Text className="mt-2 font-serif-light text-3xl text-tinta">Bienvenido</Text>
                  </View>

                  <View className="gap-4">
                    <Field
                      control={control}
                      name="email"
                      label="Correo"
                      placeholder="tu@email.com"
                      keyboardType="email-address"
                      autoComplete="email"
                      textContentType="username"
                      importantForAutofill="yes"
                      rules={{
                        required: 'El correo es obligatorio',
                        pattern: { value: /^\S+@\S+\.\S+$/, message: 'Correo inválido' },
                        maxLength: { value: 120, message: 'Máximo 120 caracteres' },
                      }}
                      maxLength={120}
                    />
                    <Field
                      control={control}
                      name="password"
                      label="Contraseña"
                      placeholder="••••••••"
                      secureTextEntry
                      autoComplete="current-password"
                      textContentType="password"
                      importantForAutofill="yes"
                      rules={{
                        required: 'La contraseña es obligatoria',
                        maxLength: { value: 72, message: 'Máximo 72 caracteres' },
                      }}
                      maxLength={72}
                    />
                  </View>

                  <MensajeError className="mt-3" texto={error} />

                  <Button
                    className="mt-8"
                    variant="gold"
                    text={enviando ? 'ENTRANDO…' : 'ENTRAR'}
                    onPress={entrar}
                    disabled={enviando}
                  />
                  <View className="mt-3">
                    <BiometricLoginButton
                      label={biometricSupport.label}
                      busy={biometricBusy}
                      disabled={enviando}
                      onPress={() => void entrarConBiometria()}
                      showHint={!biometricEnabled}
                    />
                  </View>

                  <Pressable onPress={irARecuperar} className="mb-5 mt-4 self-end">
                    <Text className="font-roboto text-xs tracking-wide text-marca">
                      ¿Olvidaste tu contraseña?
                    </Text>
                  </Pressable>

                  <Pressable onPress={irARegistro}>
                    <Text className="text-center font-roboto text-tinta/60">
                      ¿Primera vez? <Text className="font-roboto-bold text-marca">Regístrate</Text>
                    </Text>
                  </Pressable>
                </View>
              </Pergamino>
            </ScrollView>
          </Pressable>
        </Pressable>
      </EvitarTeclado>
    </Modal>
  );
}
