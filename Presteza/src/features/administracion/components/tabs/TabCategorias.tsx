import { Text, View } from 'react-native';

import CampoBusqueda from '@/components/CampoBusqueda';
import { TarjetaPerfil } from '@/features/perfil/components/TarjetaPerfil';

import { useTabCategorias } from '../../hooks/useTabCategorias';
import type { CategoriaAdmin, CategoriaForm } from '../../types';
import { idDe } from '../../utils';
import { EstadoVacioAdmin, ModalAdmin } from '../elementos';
import { FormularioCategoria } from '../formularios/FormularioCategoria';
import {
  AccionesCarta,
  CeldaTabla,
  EncabezadoTabla,
  FilaTabla,
  FotoCarta,
  InterruptorVista,
} from '../VistaCarta';

type TabCategoriasProps = {
  categorias: CategoriaAdmin[];
  guardando?: boolean;
  onGuardar: (datos: CategoriaForm, editando?: CategoriaAdmin | null) => Promise<boolean>;
  onEliminar: (categoria: CategoriaAdmin) => void;
};

export function TabCategorias({
  categorias,
  guardando,
  onGuardar,
  onEliminar,
}: TabCategoriasProps) {
  const tab = useTabCategorias(categorias, onGuardar);

  return (
    <View>
      <TarjetaPerfil
        numero="I"
        badge="CARTA"
        titulo="Categorías"
        accion={{ etiqueta: 'AGREGAR', onPress: () => tab.abrir() }}>
        <CampoBusqueda
          value={tab.busqueda}
          onChangeText={tab.setBusqueda}
          placeholder="Buscar categoría..."
          variant="oscuro"
        />
        <InterruptorVista vista={tab.vista} onChange={tab.setVista} />
        <Text className="mb-4 font-roboto text-sm text-crema/55">
          {tab.lista.length} en la carta
        </Text>

        {tab.lista.length === 0 ? (
          <EstadoVacioAdmin
            icono="grid-outline"
            titulo="Sin categorías"
            texto="Crea las secciones de la carta."
          />
        ) : tab.vista === 'lista' ? (
          <View>
            <EncabezadoTabla
              columnas={[
                { texto: 'SECCIÓN', flex: 1.1 },
                { texto: 'NOTA', flex: 1 },
              ]}
            />
            {tab.lista.map((categoria) => (
              <FilaTabla key={idDe(categoria)}>
                <CeldaTabla flex={1.1}>
                  <View className="flex-row items-center">
                    <FotoCarta uri={categoria.imageUrl} alto={48} />
                    <View className="ml-2 flex-1">
                      <Text className="font-roboto-light text-sm text-white" numberOfLines={2}>
                        {categoria.name}
                      </Text>
                      <AccionesCarta
                        onEditar={() => tab.abrir(categoria)}
                        onEliminar={() => onEliminar(categoria)}
                      />
                    </View>
                  </View>
                </CeldaTabla>
                <CeldaTabla flex={1}>
                  <Text className="font-roboto text-sm text-crema/55" numberOfLines={3}>
                    {categoria.description || 'Sin nota'}
                  </Text>
                </CeldaTabla>
              </FilaTabla>
            ))}
          </View>
        ) : (
          <View className="flex-row flex-wrap justify-between">
            {tab.lista.map((categoria) => (
              <View
                key={idDe(categoria)}
                className="mb-5 w-[48%] overflow-hidden border border-oro/25">
                <View className="relative">
                  <FotoCarta uri={categoria.imageUrl} alto={168} ancha />
                  <View className="absolute bottom-0 left-0 right-0 bg-marca-oscura/80 px-3 py-3">
                    <Text className="font-roboto text-[10px] tracking-[2px] text-oro">SECCIÓN</Text>
                    <Text className="mt-1 font-roboto-light text-xl text-white">
                      {categoria.name}
                    </Text>
                  </View>
                </View>
                <View className="bg-marca/40 px-3 py-3">
                  <Text className="font-roboto text-sm text-crema/60" numberOfLines={2}>
                    {categoria.description || 'Sin nota'}
                  </Text>
                  <AccionesCarta
                    onEditar={() => tab.abrir(categoria)}
                    onEliminar={() => onEliminar(categoria)}
                  />
                </View>
              </View>
            ))}
          </View>
        )}
      </TarjetaPerfil>

      <ModalAdmin
        visible={tab.abierto}
        titulo={tab.editando ? 'Editar categoría' : 'Nueva categoría'}
        onCerrar={tab.cerrar}>
        <FormularioCategoria
          key={idDe(tab.editando) || 'nueva'}
          valores={tab.valoresFormulario}
          onCancelar={tab.cerrar}
          onGuardar={tab.guardar}
          guardando={guardando}
        />
      </ModalAdmin>
    </View>
  );
}
