import { Text, View } from 'react-native';

import CampoBusqueda from '@/components/CampoBusqueda';
import { TarjetaPerfil } from '@/features/perfil/components/TarjetaPerfil';
import { formatCOP } from '@/services/cart/CartContext';

import { useTabProductos } from '../../hooks/useTabProductos';
import type { CategoriaAdmin, ProductoAdmin, ProductoForm } from '../../types';
import { idDe } from '../../utils';
import { ChipFiltro, EstadoVacioAdmin, ModalAdmin } from '../elementos';
import { FormularioProducto } from '../formularios/FormularioProducto';
import {
  AccionesCarta,
  CeldaTabla,
  EncabezadoTabla,
  FilaFiltros,
  FilaTabla,
  FotoCarta,
  GrillaAdmin,
  InterruptorVista,
} from '../VistaCarta';

type TabProductosProps = {
  productos: ProductoAdmin[];
  categorias: CategoriaAdmin[];
  guardando?: boolean;
  onGuardar: (datos: ProductoForm, editando?: ProductoAdmin | null) => Promise<boolean>;
  onAlternar: (producto: ProductoAdmin) => void;
  onEliminar: (producto: ProductoAdmin) => void;
};

export function TabProductos({ productos, categorias, guardando, onGuardar, onAlternar, onEliminar }: TabProductosProps) {
  const tab = useTabProductos(productos, categorias, onGuardar);

  return (
    <View>
      <TarjetaPerfil
        numero="I"
        badge="CARTA"
        titulo="Platos"
        accion={{ etiqueta: 'AGREGAR', onPress: () => tab.abrir() }}>
        <CampoBusqueda
          value={tab.busqueda}
          onChangeText={tab.setBusqueda}
          placeholder="Buscar plato..."
          variant="oscuro"
        />

        <InterruptorVista
          vista={tab.vista}
          onChange={tab.setVista}
          filtrosAbiertos={tab.filtrosAbiertos}
          onFiltros={() => tab.setFiltrosAbiertos((abierto) => !abierto)}
        />
        {tab.filtrosAbiertos ? (
          <FilaFiltros>
            <ChipFiltro etiqueta="TODOS" activo={!tab.categoriaFiltro} onPress={() => tab.setCategoriaFiltro('')} />
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
              onPress={() => tab.setDisponibilidad((prev) => (prev === 'oculto' ? 'all' : 'oculto'))}
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
            <EncabezadoTabla
              columnas={[
                { texto: 'PLATO', flex: 1.4 },
                { texto: 'CARTA', ancho: 78 },
                { texto: 'PRECIO', ancho: 82, derecha: true },
              ]}
            />
            {tab.lista.map((producto) => (
              <FilaTabla key={idDe(producto)}>
                <CeldaTabla flex={1.4}>
                  <View className="flex-row items-center">
                    <FotoCarta uri={producto.imageUrl} alto={48} redonda />
                    <View className="ml-2 flex-1">
                      <Text className="text-sm font-light text-white" numberOfLines={1}>
                        {producto.name}
                      </Text>
                      <AccionesCarta
                        onEditar={() => tab.abrir(producto)}
                        onAlternar={() => onAlternar(producto)}
                        onEliminar={() => onEliminar(producto)}
                        etiquetaAlternar={producto.available === false ? 'ACTIVAR' : 'OCULTAR'}
                      />
                    </View>
                  </View>
                </CeldaTabla>
                <CeldaTabla ancho={78}>
                  <Text className="text-[11px] text-crema/60" numberOfLines={2}>
                    {tab.nombreCategoria(producto.categoryId)}
                  </Text>
                </CeldaTabla>
                <CeldaTabla ancho={82} derecha>
                  <Text className="text-right text-sm text-oro">{formatCOP(producto.price || 0)}</Text>
                </CeldaTabla>
              </FilaTabla>
            ))}
          </View>
        ) : (
          <GrillaAdmin>
            {tab.lista.map((producto) => (
              <View key={idDe(producto)} className="mb-5 w-[48%] border border-oro/20 bg-marca/30">
                <FotoCarta uri={producto.imageUrl} alto={132} ancha />
                <View className="px-3 py-3">
                  <Text className="text-[10px] tracking-[1px] text-oro">{tab.nombreCategoria(producto.categoryId).toUpperCase()}</Text>
                  <Text className="mt-1 text-base font-light text-white" numberOfLines={2}>
                    {producto.name}
                  </Text>
                  <Text className="mt-2 text-lg text-oro">{formatCOP(producto.price || 0)}</Text>
                  <Text className="mt-1 text-[10px] tracking-[1px] text-crema/45">
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

      <ModalAdmin visible={tab.abierto} titulo={tab.editando ? 'Editar plato' : 'Nuevo plato'} onCerrar={tab.cerrar}>
        <FormularioProducto
          key={idDe(tab.editando) || 'nuevo'}
          valores={tab.valoresFormulario}
          categorias={categorias}
          onCancelar={tab.cerrar}
          onGuardar={tab.guardar}
          guardando={guardando}
        />
      </ModalAdmin>
    </View>
  );
}
