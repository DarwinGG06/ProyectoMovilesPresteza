import { Text, View } from 'react-native';

import Button from '@/components/Button';
import Field from '@/components/Field';
import MensajeError from '@/components/MensajeError';
import { PuntosTicket } from '@/features/inicio/components/MesaDecor';

import type { useContacto } from '../hooks/useContacto';

type FormularioContactoProps = Pick<
  ReturnType<typeof useContacto>,
  'control' | 'enviar' | 'enviando' | 'exito' | 'error'
>;

export function FormularioContacto({
  control,
  enviar,
  enviando,
  exito,
  error,
}: FormularioContactoProps) {
  return (
    <View className="bg-crema px-6 pb-12 pt-10">
      <Text className="font-roboto text-[10px] tracking-[4px] text-marca">CORRESPONDENCIA</Text>
      <Text className="mt-2 font-roboto-light text-3xl text-marca-oscura">Envíanos un mensaje</Text>
      <Text className="mt-2 font-roboto text-sm leading-5 text-texto/55">
        Completa la nota. La leemos en la casa y te escribimos.
      </Text>

      <View className="my-6">
        <PuntosTicket />
      </View>

      {exito ? (
        <Text className="mb-5 bg-emerald-50 px-4 py-3 font-roboto text-sm text-emerald-800">
          Mensaje enviado. Te contactamos pronto.
        </Text>
      ) : null}
      <MensajeError className="mb-5" texto={error ?? undefined} />

      <View className="gap-4">
        <Field
          control={control}
          name="name"
          label="Nombre completo"
          autoCapitalize="words"
          placeholder="Ana María Restrepo"
          maxLength={80}
          rules={{
            required: 'El nombre es obligatorio',
            minLength: { value: 2, message: 'Mínimo 2 caracteres' },
            maxLength: { value: 80, message: 'Máximo 80 caracteres' },
          }}
        />
        <Field
          control={control}
          name="email"
          label="Correo"
          keyboardType="email-address"
          placeholder="tu@email.com"
          maxLength={120}
          rules={{
            required: 'El correo es obligatorio',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Correo inválido' },
          }}
        />
        <Field
          control={control}
          name="phone"
          label="Teléfono"
          keyboardType="phone-pad"
          placeholder="3104941839"
          maxLength={10}
          rules={{
            required: 'El teléfono es obligatorio',
            pattern: { value: /^[0-9]{10}$/, message: 'Usa 10 dígitos' },
          }}
        />
        <Field
          control={control}
          name="subject"
          label="Asunto"
          placeholder="La carta, un evento, un comentario…"
          maxLength={80}
          rules={{
            required: 'El asunto es obligatorio',
            minLength: { value: 5, message: 'Mínimo 5 caracteres' },
          }}
        />
        <Field
          control={control}
          name="message"
          label="Mensaje"
          placeholder="Cuéntanos con calma."
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          className="min-h-[120px]"
          maxLength={800}
          rules={{
            required: 'El mensaje es obligatorio',
            minLength: { value: 10, message: 'Mínimo 10 caracteres' },
          }}
        />
      </View>

      <Button
        className="mt-7"
        variant="gold"
        text={enviando ? 'ENVIANDO…' : 'ENVIAR MENSAJE'}
        onPress={enviar}
        disabled={enviando}
      />
    </View>
  );
}
