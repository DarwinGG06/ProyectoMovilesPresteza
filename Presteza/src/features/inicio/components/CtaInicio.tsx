import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Linking, Pressable, Text, View } from 'react-native';

import Field from '../../../../components/Field';
import { MarcaCurso, PuntosTicket } from './MesaDecor';

type ReservaRapida = {
  nombre: string;
  personas: string;
};

export function CtaInicio() {
  const { control, handleSubmit } = useForm<ReservaRapida>({
    defaultValues: { nombre: '', personas: '' },
  });

  const reservar = handleSubmit(() => {
    router.push('/reservas');
  });

  return (
    <View className="bg-marca-oscura px-5 pb-14">
      <MarcaCurso numero="V" nombre="RESERVAS" />

      <View className="border border-oro/15 bg-crema px-5 py-6">
        <Text className="text-[10px] tracking-[4px] text-marca">RESERVA TU MESA</Text>
        <Text className="mt-2 text-3xl font-light text-marca-oscura">¿Cuántos vienen?</Text>
        <Text className="mt-1 text-sm text-texto/55">Te esperamos en Milán, Manizales.</Text>

        <View className="my-5">
          <PuntosTicket />
        </View>

        <View className="gap-4">
          <Field
            control={control}
            name="nombre"
            label="Nombre"
            placeholder="Tu nombre"
            rules={{ required: 'Escribe tu nombre' }}
          />
          <Field
            control={control}
            name="personas"
            label="Número de personas"
            placeholder="Ej: 2"
            keyboardType="number-pad"
            rules={{ required: 'Indica cuántas personas' }}
          />
        </View>

        <Pressable onPress={reservar} className="mt-6 bg-marca-oscura py-4">
          <Text className="text-center text-[11px] tracking-[3px] text-crema">RESERVAR</Text>
        </Pressable>
      </View>

      <View className="mt-6 flex-row gap-3">
        <Pressable onPress={() => router.push('/menu')} className="flex-1 border border-oro py-4">
          <Text className="text-center text-[11px] tracking-[2px] text-oro">VER MENÚ</Text>
        </Pressable>
        <Pressable onPress={() => Linking.openURL('tel:3104941839')} className="flex-1 bg-oro py-4">
          <Text className="text-center text-[11px] tracking-[2px] text-marca-oscura">LLAMAR</Text>
        </Pressable>
      </View>
    </View>
  );
}
