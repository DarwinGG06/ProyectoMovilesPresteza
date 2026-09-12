import { type ComponentProps } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { IconoNav } from '@/shared/components/nav-bar/IconoNav';

import type { PestanaAdmin } from '../types';

type NombreIcono = ComponentProps<typeof IconoNav>['name'];

const PESTANAS: { id: PestanaAdmin; etiqueta: string; icono: NombreIcono }[] = [
  { id: 'dashboard', etiqueta: 'Resumen', icono: 'speedometer-outline' },
  { id: 'productos', etiqueta: 'Productos', icono: 'restaurant-outline' },
  { id: 'pedidos', etiqueta: 'Pedidos', icono: 'receipt-outline' },
  { id: 'categorias', etiqueta: 'Categorías', icono: 'grid-outline' },
  { id: 'inventario', etiqueta: 'Inventario', icono: 'cube-outline' },
  { id: 'reservas', etiqueta: 'Reservas', icono: 'calendar-outline' },
  { id: 'adicionales', etiqueta: 'Adicionales', icono: 'add-circle-outline' },
  { id: 'mensajes', etiqueta: 'Mensajes', icono: 'mail-outline' },
  { id: 'clientes', etiqueta: 'Clientes', icono: 'people-outline' },
  { id: 'ajustes', etiqueta: 'Ajustes', icono: 'settings-outline' },
];

type PestanasAdminProps = {
  activa: PestanaAdmin;
  onChange: (id: PestanaAdmin) => void;
  contadores?: Partial<Record<PestanaAdmin, number>>;
};

export function PestanasAdmin({ activa, onChange, contadores }: PestanasAdminProps) {
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
