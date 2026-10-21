import { type ReactNode, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { Pergamino } from '@/shared/components/materiales/Pergamino';

import type { PestanaAdmin } from '../types';

const GRUPOS: {
  titulo: string;
  items: { id: PestanaAdmin; etiqueta: string }[];
}[] = [
  {
    titulo: 'Hoy',
    items: [
      { id: 'dashboard', etiqueta: 'Resumen' },
      { id: 'pedidos', etiqueta: 'Pedidos' },
      { id: 'reservas', etiqueta: 'Reservas' },
      { id: 'mensajes', etiqueta: 'Mensajes' },
    ],
  },
  {
    titulo: 'Carta',
    items: [
      { id: 'productos', etiqueta: 'Productos' },
      { id: 'categorias', etiqueta: 'Categorías' },
      { id: 'adicionales', etiqueta: 'Adicionales' },
    ],
  },
  {
    titulo: 'Casa',
    items: [
      { id: 'inventario', etiqueta: 'Inventario' },
      { id: 'clientes', etiqueta: 'Clientes' },
      { id: 'ajustes', etiqueta: 'Ajustes' },
    ],
  },
];

const TITULOS: Record<PestanaAdmin, string> = {
  dashboard: 'Resumen',
  productos: 'Productos',
  pedidos: 'Pedidos',
  categorias: 'Categorías',
  inventario: 'Inventario',
  reservas: 'Reservas',
  adicionales: 'Adicionales',
  mensajes: 'Mensajes',
  clientes: 'Clientes',
  ajustes: 'Ajustes',
};

const CON_NUMERO: PestanaAdmin[] = ['pedidos', 'reservas', 'mensajes'];

type MenuAdminProps = {
  activa: PestanaAdmin;
  onChange: (id: PestanaAdmin) => void;
  contadores?: Partial<Record<PestanaAdmin, number>>;
  children?: ReactNode;
};

export function MenuAdmin({ activa, onChange, contadores, children }: MenuAdminProps) {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <Pressable onPress={() => setAbierto(true)} hitSlop={8}>
        {children ?? (
          <Text className="font-roboto text-[10px] tracking-[3px] text-tinta/40">ADMINISTRACIÓN</Text>
        )}
      </Pressable>

      <Modal visible={abierto} transparent animationType="slide" onRequestClose={() => setAbierto(false)}>
        <View className="flex-1 justify-end bg-marca-oscura/40">
          <Pressable className="flex-1" onPress={() => setAbierto(false)} />
          <View className="overflow-hidden rounded-t-[32px]">
            <Pergamino>
              <View className="px-6 pb-10 pt-3">
                <View className="mb-5 h-px w-10 self-center bg-madera/40" />
                <Text className="mb-5 font-serif-light text-[26px] text-tinta">Ir a</Text>
                <ScrollView style={{ maxHeight: 420 }} keyboardShouldPersistTaps="handled">
                  {GRUPOS.map((grupo, grupoIndex) => (
                    <View key={grupo.titulo} className={grupoIndex > 0 ? 'mt-5' : undefined}>
                      <Text className="mb-1 font-roboto text-[10px] tracking-[3px] text-marca">
                        {grupo.titulo}
                      </Text>
                      {grupo.items.map((item) => {
                        const seleccionada = activa === item.id;
                        const cuenta = CON_NUMERO.includes(item.id) ? (contadores?.[item.id] ?? 0) : 0;

                        return (
                          <Pressable
                            key={item.id}
                            onPress={() => {
                              setAbierto(false);
                              onChange(item.id);
                            }}
                            className="flex-row items-baseline py-3">
                            <Text
                              className={`flex-1 font-serif text-[22px] ${
                                seleccionada ? 'text-marca' : 'text-tinta'
                              }`}>
                              {item.etiqueta}
                            </Text>
                            {cuenta > 0 ? (
                              <Text className="font-roboto text-[13px] text-marca">{cuenta}</Text>
                            ) : null}
                          </Pressable>
                        );
                      })}
                    </View>
                  ))}
                </ScrollView>
              </View>
            </Pergamino>
          </View>
        </View>
      </Modal>
    </>
  );
}

export function EncabezadoSeccionAdmin({
  pestana,
  onVolver,
  onChange,
  contadores,
}: {
  pestana: Exclude<PestanaAdmin, 'dashboard'>;
  onVolver: () => void;
  onChange: (id: PestanaAdmin) => void;
  contadores?: Partial<Record<PestanaAdmin, number>>;
}) {
  return (
    <View className="bg-crema px-6 pb-3 pt-6">
      <Pressable onPress={onVolver} hitSlop={8} className="self-start py-1">
        <Text className="font-roboto text-[10px] tracking-[3px] text-tinta/40">←  ADMINISTRACIÓN</Text>
      </Pressable>
      <View className="mt-2">
        <MenuAdmin activa={pestana} onChange={onChange} contadores={contadores}>
          <View className="flex-row items-center">
            <Text className="font-serif-light text-[34px] text-tinta">{TITULOS[pestana]}</Text>
            <Text className="ml-2 font-serif text-lg text-marca/50">▾</Text>
          </View>
        </MenuAdmin>
      </View>
    </View>
  );
}

export function PestanasAdmin(props: MenuAdminProps) {
  return <MenuAdmin {...props} />;
}
