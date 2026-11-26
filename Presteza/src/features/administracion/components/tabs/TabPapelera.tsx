import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { TarjetaPerfil } from '@/features/perfil/components/TarjetaPerfil';
import { IconoNav } from '@/shared/components/nav-bar/IconoNav';
import {
  etiquetaKind,
  formatoFechaPapelera,
  usePapelera,
} from '@/shared/papelera/usePapelera';

import { ChipFiltro, EnlaceAdmin, EstadoVacioAdmin } from '../elementos';

export function TabPapelera() {
  const papelera = usePapelera('admin');

  return (
    <View>
      <TarjetaPerfil compacto numero="I" badge="ARCHIVO" titulo="Papelera">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="font-roboto text-[12px] tracking-[2px] text-marca">
            {papelera.items.length} EN ARCHIVO
          </Text>
          <Pressable
            onPress={() => void papelera.recargar()}
            accessibilityRole="button"
            className="min-h-12 justify-center px-1">
            <Text className="font-roboto text-[12px] tracking-[2px] text-marca">ACTUALIZAR</Text>
          </Pressable>
        </View>

        <View className="mb-3 flex-row flex-wrap">
          {papelera.filtros.map((item) => (
            <ChipFiltro
              key={item.id}
              etiqueta={item.etiqueta}
              activo={papelera.filtro === item.id}
              onPress={() => papelera.setFiltro(item.id)}
            />
          ))}
        </View>

        {papelera.cargando ? (
          <View className="items-center py-10">
            <ActivityIndicator color="#6b1d3d" />
          </View>
        ) : papelera.error ? (
          <Text className="font-roboto text-sm text-red-700">{papelera.error}</Text>
        ) : papelera.lista.length === 0 ? (
          <EstadoVacioAdmin
            icono="trash-outline"
            titulo="Papelera vacía"
            texto="Lo que borres de pedidos, reservas o mensajes llega aquí."
          />
        ) : (
          <View className="gap-3">
            {papelera.lista.map((item) => (
              <View
                key={`${item.kind}-${item.id}`}
                className="rounded-[22px] bg-white px-4 py-4"
                style={{
                  shadowColor: '#3a0c20',
                  shadowOpacity: 0.06,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 3 },
                  elevation: 2,
                }}>
                <View className="flex-row items-start gap-3">
                  <View className="mt-0.5 h-11 w-11 items-center justify-center rounded-full bg-marca/10">
                    <IconoNav name="trash-outline" size={18} className="text-marca" />
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text className="font-roboto text-[12px] tracking-[2px] text-marca">
                      {etiquetaKind(item.kind)}
                    </Text>
                    <Text className="mt-1 font-serif text-[20px] text-tinta">{item.title}</Text>
                    <Text className="mt-1 font-roboto text-sm text-tinta/70" numberOfLines={2}>
                      {item.subtitle}
                    </Text>
                    {item.deletedAt ? (
                      <Text className="mt-1 font-roboto text-[12px] text-tinta/55">
                        Archivado {formatoFechaPapelera(item.deletedAt)}
                      </Text>
                    ) : null}
                    <View className="mt-3 flex-row flex-wrap">
                      <EnlaceAdmin
                        etiqueta="RESTAURAR"
                        onPress={() => papelera.restaurar(item)}
                      />
                      <EnlaceAdmin
                        etiqueta="VACIAR"
                        peligro
                        onPress={() => papelera.vaciar(item)}
                      />
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </TarjetaPerfil>
    </View>
  );
}
