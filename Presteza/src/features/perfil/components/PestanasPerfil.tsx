import { type ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Pergamino } from '@/shared/components/materiales/Pergamino';
import { IconoNav } from '@/shared/components/nav-bar/IconoNav';

import type { PestanaId } from '../types';

type NombreIcono = ComponentProps<typeof IconoNav>['name'];

const INDICE: {
  id: Exclude<PestanaId, 'cuenta'>;
  etiqueta: string;
  detalle: string;
  icono: NombreIcono;
}[] = [
  { id: 'pedidos', etiqueta: 'Pedidos', detalle: 'Tu historial', icono: 'bag-handle-outline' },
  { id: 'reservas', etiqueta: 'Reservas', detalle: 'Tus mesas', icono: 'calendar-outline' },
  { id: 'puntos', etiqueta: 'Puntos', detalle: 'Fidelidad', icono: 'star-outline' },
  { id: 'direcciones', etiqueta: 'Direcciones', detalle: 'Dónde llevar', icono: 'location-outline' },
  { id: 'pagos', etiqueta: 'Pagos', detalle: 'Tus tarjetas', icono: 'card-outline' },
  { id: 'ajustes', etiqueta: 'Cuenta', detalle: 'Datos y sesión', icono: 'person-outline' },
];

const TITULOS: Record<Exclude<PestanaId, 'cuenta'>, string> = {
  pedidos: 'Pedidos',
  reservas: 'Reservas',
  puntos: 'Puntos',
  direcciones: 'Direcciones',
  pagos: 'Pagos',
  ajustes: 'Cuenta',
};

type IndiceMesaProps = {
  onChange: (id: PestanaId) => void;
  contadores?: Partial<Record<PestanaId, number>>;
};

export function PestanasPerfil({ onChange, contadores }: IndiceMesaProps) {
  return (
    <View className="-mx-1.5 mt-5 flex-row flex-wrap">
      {INDICE.map((item) => {
        const cuenta = contadores?.[item.id] ?? 0;
        const conNumero = (item.id === 'pedidos' || item.id === 'reservas') && cuenta > 0;

        return (
          <View key={item.id} className="w-1/2 px-1.5 pb-3">
            <View className="overflow-hidden rounded-[28px]">
              <Pergamino>
                <Pressable onPress={() => onChange(item.id)} className="min-h-[118px] px-4 py-4 active:opacity-80">
                  <View className="flex-row items-center justify-between">
                    <IconoNav name={item.icono} size={20} className="text-marca" />
                    {conNumero ? (
                      <View className="min-w-[22px] items-center rounded-full bg-marca px-1.5 py-0.5">
                        <Text className="font-roboto text-[11px] text-crema">{cuenta}</Text>
                      </View>
                    ) : (
                      <IconoNav name="chevron-forward" size={16} className="text-marca/40" />
                    )}
                  </View>
                  <Text className="mt-5 font-serif text-[22px] text-tinta">{item.etiqueta}</Text>
                  <Text className="mt-1 font-roboto text-[12px] text-tinta/45">{item.detalle}</Text>
                </Pressable>
              </Pergamino>
            </View>
          </View>
        );
      })}
    </View>
  );
}

export function EncabezadoSeccion({
  pestana,
  onVolver,
  contador,
}: {
  pestana: PestanaId;
  onVolver: () => void;
  contador?: number;
}) {
  const titulo = pestana === 'cuenta' ? 'Cuenta' : TITULOS[pestana];
  const mostrarNumero =
    (pestana === 'pedidos' || pestana === 'reservas') && typeof contador === 'number' && contador > 0;

  return (
    <View className="px-6 pt-8">
      <Pressable onPress={onVolver} hitSlop={8} className="self-start py-1">
        <Text className="font-roboto text-[10px] tracking-[3px] text-oro">←  CUENTA</Text>
      </Pressable>
      <View className="mt-2 flex-row items-center">
        <Text className="font-serif-light text-[34px] text-crema">{titulo}</Text>
        {mostrarNumero ? (
          <View className="ml-3 min-w-[26px] items-center rounded-full bg-marca px-2 py-0.5">
            <Text className="font-roboto text-[12px] text-crema">{contador}</Text>
          </View>
        ) : null}
      </View>
      <View className="mt-3 h-px w-10 bg-oro" />
    </View>
  );
}
