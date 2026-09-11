import { type ComponentProps } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { IconoNav } from '@/shared/components/nav-bar/IconoNav';

import type { PestanaId } from '../types';

type NombreIcono = ComponentProps<typeof IconoNav>['name'];

const PESTANAS: { id: PestanaId; etiqueta: string; icono: NombreIcono }[] = [
  { id: 'cuenta', etiqueta: 'Cuenta', icono: 'person-outline' },
  { id: 'pedidos', etiqueta: 'Pedidos', icono: 'receipt-outline' },
  { id: 'direcciones', etiqueta: 'Direcciones', icono: 'location-outline' },
  { id: 'pagos', etiqueta: 'Pagos', icono: 'card-outline' },
  { id: 'reservas', etiqueta: 'Reservas', icono: 'calendar-outline' },
  { id: 'ajustes', etiqueta: 'Ajustes', icono: 'settings-outline' },
];

type PestanasPerfilProps = {
  activa: PestanaId;
  onChange: (id: PestanaId) => void;
  contadores?: Partial<Record<PestanaId, number>>;
};

export function PestanasPerfil({ activa, onChange, contadores }: PestanasPerfilProps) {
  return (
    <View className="border-b border-oro/15 bg-marca-oscura">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="px-5">
        {PESTANAS.map((pestana) => {
          const seleccionada = activa === pestana.id;
          const conteo = contadores?.[pestana.id];

          return (
            <Pressable key={pestana.id} onPress={() => onChange(pestana.id)} className="mr-7 py-4">
              <View className="flex-row items-center gap-1.5">
                <IconoNav name={pestana.icono} size={14} className={seleccionada ? 'text-oro' : 'text-crema/35'} />
                <Text className={`text-[11px] tracking-[2px] ${seleccionada ? 'text-crema' : 'text-crema/35'}`}>
                  {pestana.etiqueta.toUpperCase()}
                </Text>
                {conteo ? <Text className="text-[10px] text-oro">{conteo}</Text> : null}
              </View>
              <View className={`mt-2 h-px w-10 ${seleccionada ? 'bg-oro' : 'bg-transparent'}`} />
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
