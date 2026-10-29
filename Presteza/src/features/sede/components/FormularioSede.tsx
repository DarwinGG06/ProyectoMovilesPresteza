import { Text, View } from 'react-native';

import Button from '@/components/Button';
import Field from '@/components/Field';
import { MarcaCurso } from '@/features/inicio/components/MesaDecor';
import { Pergamino } from '@/shared/components/materiales/Pergamino';

import { useFormularioSede } from '../hooks/useFormularioSede';

export function FormularioSede() {
  const { control, reservar, verMenu, llamar } = useFormularioSede();

  return (
    <View className="px-5 pb-14">
      <MarcaCurso numero="V" nombre="RESERVAS" />
      <Text className="mb-6 font-roboto text-sm text-crema/70">
        Nombre y cuántas personas van a la sede.
      </Text>

      <Pergamino>
        <View className="px-6 py-8">
          <Text className="font-roboto text-[10px] tracking-[4px] text-marca">RESERVA TU MESA</Text>
          <Text className="mt-3 font-serif-light text-3xl text-tinta">¿Vienes a Milán?</Text>
          <Text className="mt-2 font-serif-italic text-base text-tinta/70">
            Te esperamos en Torre Plaza 70.
          </Text>

          <View className="mb-7 mt-7 h-px w-10 bg-marca/25" />

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
      </Pergamino>

      <View className="mt-6 flex-row gap-3">
        <Button text="VER MENÚ" onPress={verMenu} variant="ghost" className="flex-1" />
        <Button text="LLAMAR" onPress={llamar} variant="gold" className="flex-1" />
      </View>
    </View>
  );
}
