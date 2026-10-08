import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Linking, Text, View } from 'react-native';

import { MarcaCurso, PuntosTicket } from '@/features/inicio/components/MesaDecor';

import Button from '@/components/Button';
import Field from '@/components/Field';
import { SEDE } from '../data';

type VisitaSede = {
  nombre: string;
  personas: string;
};

export function FormularioSede() {
  const { control, handleSubmit } = useForm<VisitaSede>({
    defaultValues: { nombre: '', personas: '' },
  });

  const reservar = handleSubmit(() => {
    router.push('/reservas');
  });

  return (
    <View className="px-5 pb-14">
      <MarcaCurso numero="V" nombre="RESERVAS" />
      <Text className="mb-6 font-roboto text-sm text-crema/55">
        Nombre y cuántas personas van a la sede.
      </Text>

      <View className="border border-oro/20 bg-crema px-5 py-6">
        <Text className="font-roboto text-[10px] tracking-[4px] text-marca">RESERVA TU MESA</Text>
        <Text className="mt-2 font-roboto-light text-3xl text-marca-oscura">¿Vienes a Milán?</Text>
        <Text className="mt-1 font-roboto text-sm text-texto/55">
          Te esperamos en Torre Plaza 70.
        </Text>

        <View className="my-5">
          <PuntosTicket />
        </View>

        <View className="gap-4">
          <Field
            control={control}
            name="nombre"
            label="Nombre"
            placeholder="Tu nombre"
            maxLength={80}
            rules={{
              required: 'Escribe tu nombre',
              maxLength: { value: 80, message: 'Máximo 80 caracteres' },
            }}
          />
          <Field
            control={control}
            name="personas"
            label="Número de personas"
            placeholder="Ej: 2"
            keyboardType="number-pad"
            maxLength={2}
            rules={{ required: 'Indica cuántas personas' }}
          />
        </View>

        <Button text="RESERVAR" onPress={reservar} className="mt-6" />
      </View>

      <View className="mt-6 flex-row gap-3">
        <Button
          text="VER MENÚ"
          onPress={() => router.push('/menu')}
          variant="ghost"
          className="flex-1"
        />
        <Button
          text="LLAMAR"
          onPress={() => Linking.openURL(`tel:${SEDE.telefono}`)}
          variant="gold"
          className="flex-1"
        />
      </View>
    </View>
  );
}
