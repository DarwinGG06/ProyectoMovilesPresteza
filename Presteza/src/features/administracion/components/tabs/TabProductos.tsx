import { Text, View } from 'react-native';

import CampoBusqueda from '@/components/CampoBusqueda';
import { TarjetaPerfil } from '@/features/perfil/components/TarjetaPerfil';
import { formatCOP } from '@/services/cart/CartContext';

import { useTabProductos } from '../../hooks/useTabProductos';
import type { AdicionalAdmin, CategoriaAdmin, ProductoAdmin, ProductoForm } from '../../types';
import { idDe } from '../../utils';
import { BotonAgregarAdmin, ChipFiltro, EstadoVacioAdmin, ModalAdmin } from '../elementos';
import { FormularioProducto } from '../formularios/FormularioProducto';
import {
  AccionesCarta,
  FilaFiltros,
  FilaTabla,
  FotoCarta,
  GrillaAdmin,
  InterruptorVista,
} from '../VistaCarta';

type TabProductosProps = {
  productos: ProductoAdmin[];
  categorias: CategoriaAdmin[];
  adicionales?: AdicionalAdmin[];
  guardando?: boolean;
  onGuardar: (datos: ProductoForm, editando?: ProductoAdmin | null) => Promise<boolean>;
  onAlternar: (producto: ProductoAdmin) => void;
  onEliminar: (producto: ProductoAdmin) => void;
};

export function TabProductos({
  productos,
  categorias,
  adicionales = [],
  guardando,
  onGuardar,
  onAlternar,
  onEliminar,
}: TabProductosProps) {
  const tab = useTabProductos(productos, categorias, onGuardar, adicionales);

  return (
    <View>
      <TarjetaPerfil numero="I" badge="CARTA" titulo="Platos" compacto>
        <BotonAgregarAdmin etiqueta="AGREGAR PLATO" onPress={() => tab.abrir()} />
        <CampoBusqueda
          value={tab.busqueda}
          onChangeText={tab.setBusqueda}
          placeholder="Buscar plato..."
          variant="claro"
        />

        <InterruptorVista
          vista={tab.vista}
          onChange={tab.setVista}
          filtrosAbiertos={tab.filtrosAbiertos}
          onFiltros={() => tab.setFiltrosAbiertos((abierto) => !abierto)}
        />
        {tab.filtrosAbiertos ? (
          <FilaFiltros>
            <ChipFiltro
              etiqueta="TODOS"
              activo={!tab.categoriaFiltro}
              onPress={() => tab.setCategoriaFiltro('')}
            />
            {categorias.map((categoria) => (
              <ChipFiltro
                key={idDe(categoria)}
                etiqueta={categoria.name.toUpperCase()}
                activo={tab.categoriaFiltro === idDe(categoria)}
                onPress={() => tab.setCategoriaFiltro(idDe(categoria))}
              />
            ))}
            <ChipFiltro
              etiqueta="EN CARTA"
              activo={tab.disponibilidad === 'carta'}
              onPress={() => tab.setDisponibilidad((prev) => (prev === 'carta' ? 'all' : 'carta'))}
            />
            <ChipFiltro
              etiqueta="OCULTOS"
              activo={tab.disponibilidad === 'oculto'}
              onPress={() =>
                tab.setDisponibilidad((prev) => (prev === 'oculto' ? 'all' : 'oculto'))
              }
            />
          </FilaFiltros>
        ) : null}

        {tab.lista.length === 0 ? (
          <EstadoVacioAdmin
            icono="restaurant-outline"
            titulo="Sin platos"
            texto="La carta todavía no tiene platos en el servidor. Usa Agregar para crear el primero."
          />
        ) : tab.vista === 'lista' ? (
          <View>
            {tab.lista.map((producto) => (
              <FilaTabla key={idDe(producto)}>
                <View className="flex-row">
                  <FotoCarta uri={producto.imageUrl} alto={64} />
                  <View className="ml-3 flex-1">
                    <View className="flex-row items-start justify-between gap-2">
                      <Text
                        className="flex-1 font-roboto-light text-base text-tinta"
                        numberOfLines={2}>
                        {producto.name}
                      </Text>
                      <Text className="font-roboto text-sm text-marca">
                        {formatCOP(producto.price || 0)}
                      </Text>
                    </View>
                    <Text className="mt-1 font-roboto text-[10px] tracking-[1.4px] text-tinta/70">
                      {tab.nombreCategoria(producto.categoryId).toUpperCase()}
                      {'  ·  '}
                      {producto.available === false ? 'OCULTO' : 'EN CARTA'}
                    </Text>
                    <AccionesCarta
                      onEditar={() => tab.abrir(producto)}
                      onAlternar={() => onAlternar(producto)}
                      onEliminar={() => onEliminar(producto)}
                      etiquetaAlternar={producto.available === false ? 'ACTIVAR' : 'OCULTAR'}
                    />
                  </View>
                </View>
              </FilaTabla>
            ))}
          </View>
        ) : (
          <GrillaAdmin>
            {tab.lista.map((producto) => (
              <View
                key={idDe(producto)}
                className="mb-5 w-[48%] overflow-hidden rounded-[22px] bg-white"
                style={{
                  shadowColor: '#3a0c20',
                  shadowOpacity: 0.06,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 3 },
                  elevation: 2,
                }}>
                <FotoCarta uri={producto.imageUrl} alto={132} ancha />
                <View className="px-3 py-3">
                  <Text className="font-roboto text-[10px] tracking-[1px] text-marca">
                    {tab.nombreCategoria(producto.categoryId).toUpperCase()}
                  </Text>
                  <Text className="mt-1 font-roboto-light text-base text-tinta" numberOfLines={2}>
                    {producto.name}
                  </Text>
                  <Text className="mt-2 font-roboto text-lg text-marca">
                    {formatCOP(producto.price || 0)}
                  </Text>
                  <Text className="mt-1 font-roboto text-[10px] tracking-[1px] text-tinta/70">
                    {producto.available === false ? 'OCULTO' : 'EN CARTA'}
                  </Text>
                  <AccionesCarta
                    onEditar={() => tab.abrir(producto)}
                    onAlternar={() => onAlternar(producto)}
                    onEliminar={() => onEliminar(producto)}
                    etiquetaAlternar={producto.available === false ? 'ACTIVAR' : 'OCULTAR'}
                  />
                </View>
              </View>
            ))}
          </GrillaAdmin>
        )}
      </TarjetaPerfil>

      <ModalAdmin
        visible={tab.abierto}
        titulo={tab.editando ? 'Editar plato' : 'Nuevo plato'}
        onCerrar={tab.cerrar}>
        <FormularioProducto
          key={idDe(tab.editando) || 'nuevo'}
          valores={tab.valoresFormulario}
          categorias={categorias}
          adicionales={adicionales}
          onCancelar={tab.cerrar}
          onGuardar={tab.guardar}
          guardando={guardando}
        />
      </ModalAdmin>
    </View>
  );
}
