import { ActivityIndicator, Text, View } from 'react-native';

import { IconoNav } from '@/shared/components/nav-bar/IconoNav';
import {
  etiquetaKind,
  formatoFechaPapelera,
  usePapelera,
} from '@/shared/papelera/usePapelera';

import { EnlaceAccion, LineaCuenta } from '../elementos';
import { EstadoVacio, TarjetaPerfil } from '../TarjetaPerfil';

export function TabPapelera() {
  const papelera = usePapelera('cliente');

  return (
    <TarjetaPerfil numero="I" badge="ARCHIVO" titulo="Papelera" compacto>
      <View className="mb-3 flex-row flex-wrap gap-2">
        {papelera.filtros.map((item) => {
          const activo = papelera.filtro === item.id;
          return (
            <EnlaceAccion
              key={item.id}
              etiqueta={item.etiqueta.toUpperCase()}
              onPress={() => papelera.setFiltro(item.id)}
              activo={activo}
            />
          );
        })}
      </View>

      {papelera.cargando ? (
        <View className="items-center py-8">
          <ActivityIndicator color="#6b1d3d" />
        </View>
      ) : papelera.error ? (
        <Text className="font-roboto text-sm text-red-700">{papelera.error}</Text>
      ) : papelera.lista.length === 0 ? (
        <EstadoVacio
          icono="trash-outline"
          titulo="Nada en la papelera"
          texto="Los pedidos y reservas que borres quedan aquí por si quieres recuperarlos."
        />
      ) : (
        <View>
          {papelera.lista.map((item, index) => (
            <LineaCuenta
              key={`${item.kind}-${item.id}`}
              indice={index}
              titulo={item.title}
              sello={etiquetaKind(item.kind)}>
              <View className="mt-2 flex-row items-center gap-2">
                <IconoNav name="trash-outline" size={14} className="text-marca/70" />
                <Text className="flex-1 font-roboto text-sm text-tinta/70" numberOfLines={2}>
                  {item.subtitle}
                </Text>
              </View>
              {item.deletedAt ? (
                <Text className="mt-1 font-roboto text-[12px] text-tinta/55">
                  Archivado {formatoFechaPapelera(item.deletedAt)}
                </Text>
              ) : null}
              <View className="mt-3 flex-row">
                <EnlaceAccion etiqueta="RESTAURAR" onPress={() => papelera.restaurar(item)} />
                <EnlaceAccion
                  etiqueta="VACIAR"
                  peligro
                  onPress={() => papelera.vaciar(item)}
                />
              </View>
            </LineaCuenta>
          ))}
        </View>
      )}
    </TarjetaPerfil>
  );
}
