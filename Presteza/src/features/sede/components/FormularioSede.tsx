import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Linking, Pressable, Text, View } from 'react-native';

import { MarcaCurso, PuntosTicket } from '@/features/inicio/components/MesaDecor';

import Field from '../../../../components/Field';
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
      <Text className="mb-6 text-sm text-crema/55">Nombre y cuántas personas van a la sede.</Text>

      <View className="border border-oro/20 bg-crema px-5 py-6">
        <Text className="text-[10px] tracking-[4px] text-marca">RESERVA TU MESA</Text>
        <Text className="mt-2 text-3xl font-light text-marca-oscura">¿Vienes a Milán?</Text>
        <Text className="mt-1 text-sm text-texto/55">Te esperamos en Torre Plaza 70.</Text>

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
        <Pressable onPress={() => Linking.openURL(`tel:${SEDE.telefono}`)} className="flex-1 bg-oro py-4">
          <Text className="text-center text-[11px] tracking-[2px] text-marca-oscura">LLAMAR</Text>
        </Pressable>
      </View>
    </View>
  );
}
