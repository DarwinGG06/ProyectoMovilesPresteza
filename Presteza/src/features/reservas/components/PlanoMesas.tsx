import { Pressable, Text, View } from 'react-native';

import { IconoNav } from '@/shared/components/nav-bar/IconoNav';

import type { MesaVisual } from '../types';
import { IconoMesa } from './IconoMesa';
import { LeyendaMesas } from './LeyendaMesas';

type PlanoMesasProps = {
  mesas: MesaVisual[];
  mesaId?: string;
  barra: boolean;
  personalizada: boolean;
  onMesa: (mesa: MesaVisual) => void;
  onBarra: () => void;
  onPersonalizada: () => void;
};

export function PlanoMesas({
  mesas,
  mesaId,
  barra,
  personalizada,
  onMesa,
  onBarra,
  onPersonalizada,
}: PlanoMesasProps) {
  const grupos = agruparPorCapacidad(mesas);

  return (
    <View className="overflow-hidden rounded-[28px] border border-oro/35 bg-marca-oscura">
      <View className="px-4 pb-2 pt-5">
        <Text className="text-center text-[10px] tracking-[4px] text-oro">SALÓN PRESTEZA</Text>
        <Text className="mt-1 text-center text-2xl font-light text-crema">Elige tu mesa</Text>
        <Text className="mb-4 mt-1 text-center text-sm text-crema/60">Toca una mesa libre.</Text>
        <LeyendaMesas />
      </View>

      <View className="bg-crema px-2 pb-2 pt-4">
        {grupos.map((grupo) => (
          <View key={grupo.capacity} className="mb-4">
            <Text className="mb-2 text-center text-[10px] tracking-[3px] text-marca">
              {etiquetaCapacidad(grupo.capacity)}
            </Text>
            <View className="flex-row flex-wrap">
              {grupo.mesas.map((mesa) => (
                <TarjetaMesa
                  key={mesa.id}
                  mesa={mesa}
                  seleccionada={mesaId === mesa.id}
                  onPress={() => {
                    if (mesa.available) onMesa(mesa);
                  }}
                />
              ))}
            </View>
          </View>
        ))}
      </View>

      <View className="px-4 py-5">
        <Text className="mb-3 text-[11px] tracking-[3px] text-oro">OTRAS OPCIONES</Text>
        <View className="flex-row gap-3">
          <Pressable
            onPress={onBarra}
            className={`flex-1 rounded-2xl border px-3 py-4 ${barra ? 'border-oro bg-oro' : 'border-oro/35 bg-crema'}`}>
            <IconoNav name="wine-outline" size={22} className="text-marca-oscura" />
            <Text className="mt-2 text-[11px] tracking-[2px] text-marca-oscura">BARRA</Text>
            <Text className="mt-1 text-xs text-texto/60">1 o más personas</Text>
          </Pressable>
          <Pressable
            onPress={onPersonalizada}
            className={`flex-1 rounded-2xl border px-3 py-4 ${personalizada ? 'border-oro bg-oro' : 'border-oro/35 bg-crema'}`}>
            <IconoNav name="sparkles-outline" size={22} className="text-marca-oscura" />
            <Text className="mt-2 text-[11px] tracking-[2px] text-marca-oscura">A TU MEDIDA</Text>
            <Text className="mt-1 text-xs text-texto/60">Grupo grande</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function agruparPorCapacidad(mesas: MesaVisual[]) {
  const capacidades = [...new Set(mesas.map((mesa) => mesa.capacity))].sort((a, b) => a - b);
  return capacidades.map((capacity) => ({
    capacity,
    mesas: mesas.filter((mesa) => mesa.capacity === capacity),
  }));
}

function etiquetaCapacidad(capacity: number) {
  return capacity === 1 ? '1 PERSONA' : `${capacity} PERSONAS`;
}

function TarjetaMesa({
  mesa,
  seleccionada,
  onPress,
}: {
  mesa: MesaVisual;
  seleccionada: boolean;
  onPress: () => void;
}) {
  const ocupada = !mesa.available;
  const numero = mesa.id.replace(/^T/, '');

  return (
    <Pressable
      onPress={onPress}
      disabled={ocupada}
      className={`mb-3 w-1/3 items-center rounded-2xl border-2 py-2 ${
        seleccionada ? 'border-oro bg-oro/20' : 'border-transparent'
      }`}>
      <IconoMesa ocupada={ocupada} />
      <Text className="mt-1 text-[14px] font-medium text-[#2c2c2c]">Mesa {numero}</Text>
      <Text className={`text-[12px] ${ocupada ? 'font-medium text-[#e53935]' : 'text-[#8d8d8d]'}`}>
        {ocupada ? 'Ocupada' : 'Libre'}
      </Text>
    </Pressable>
  );
}
