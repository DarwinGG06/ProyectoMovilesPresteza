import { useMemo, useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { TarjetaPerfil } from '@/features/perfil/components/TarjetaPerfil';
import { formatCOP } from '@/services/cart/CartContext';
import { useAviso } from '@/shared/components/aviso';

import { actualizarProducto, crearProducto, eliminarProducto } from '../../api/adminApi';
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
  token: string;
  productos: ProductoAdmin[];
  setProductos: (productos: ProductoAdmin[]) => void;
  categorias: CategoriaAdmin[];
};

export function TabProductos({ token, productos, setProductos, categorias }: TabProductosProps) {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [disponibilidad, setDisponibilidad] = useState<'all' | 'carta' | 'oculto'>('all');
  const [vista, setVista] = useState<'lista' | 'cuadricula'>('lista');
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(true);
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState<ProductoAdmin | null>(null);
  const [guardando, setGuardando] = useState(false);
  const aviso = useAviso();

  const lista = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return productos.filter((producto) => {
      const coincideTexto = !texto || producto.name.toLowerCase().includes(texto);
      const coincideCategoria = !categoriaFiltro || producto.categoryId === categoriaFiltro;
      const coincideCarta =
        disponibilidad === 'all' ||
        (disponibilidad === 'carta' ? producto.available !== false : producto.available === false);
      return coincideTexto && coincideCategoria && coincideCarta;
    });
  }, [busqueda, categoriaFiltro, disponibilidad, productos]);

  const nombreCategoria = (id?: string) => categorias.find((categoria) => idDe(categoria) === id)?.name || '—';

  const abrir = (producto?: ProductoAdmin) => {
    setEditando(producto ?? null);
    setAbierto(true);
  };

  const guardar = async (datos: ProductoForm) => {
    setGuardando(true);
    try {
      const cuerpo = {
        name: datos.name.trim(),
        description: datos.description.trim(),
        price: Number(datos.price),
        categoryId: datos.categoryId,
        imageUrl: datos.imageUrl.trim(),
        available: editando?.available !== false,
      };
      if (editando) {
        const actualizado = await actualizarProducto(token, idDe(editando), cuerpo);
        setProductos(productos.map((item) => (idDe(item) === idDe(editando) ? { ...item, ...actualizado, ...cuerpo } : item)));
        aviso.ok('Plato editado', `${cuerpo.name} fue editado.`);
      } else {
        setProductos([await crearProducto(token, cuerpo), ...productos]);
        aviso.ok('Plato creado', `${cuerpo.name} ya está en la carta.`);
      }
      setAbierto(false);
    } catch (err) {
      aviso.errorDe(err, 'No se pudo guardar.', 'Producto');
    } finally {
      setGuardando(false);
    }
  };

  const alternar = async (producto: ProductoAdmin) => {
    try {
      const available = producto.available === false;
      await actualizarProducto(token, idDe(producto), { available });
      setProductos(productos.map((item) => (idDe(item) === idDe(producto) ? { ...item, available } : item)));
      aviso.ok(
        available ? 'Plato activado' : 'Plato oculto',
        available ? `${producto.name} volvió a la carta.` : `${producto.name} quedó oculto.`,
      );
    } catch (err) {
      aviso.errorDe(err, 'No se pudo actualizar.', 'Producto');
    }
  };

  const borrar = (producto: ProductoAdmin) => {
    aviso.confirmar({
      sello: 'CARTA',
      titulo: 'Eliminar plato',
      texto: `¿Quitar ${producto.name} de la carta?`,
      confirmar: 'ELIMINAR',
      peligro: true,
      exito: {
        titulo: 'Plato eliminado',
        texto: `${producto.name} fue eliminado de la carta.`,
      },
      onConfirmar: async () => {
        await eliminarProducto(token, idDe(producto));
        setProductos(productos.filter((item) => idDe(item) !== idDe(producto)));
      },
    });
  };

  return (
    <View>
      <TarjetaPerfil
        numero="I"
        badge="CARTA"
        titulo="Platos"
        accion={{ etiqueta: 'AGREGAR', onPress: () => abrir() }}>
        <TextInput
          value={busqueda}
          onChangeText={setBusqueda}
          placeholder="Buscar plato..."
          placeholderTextColor="#d4af7788"
          className="mb-4 border-b border-oro/30 py-3 text-crema"
        />

        <InterruptorVista
          vista={vista}
          onChange={setVista}
          filtrosAbiertos={filtrosAbiertos}
          onFiltros={() => setFiltrosAbiertos((abierto) => !abierto)}
        />
        {filtrosAbiertos ? (
          <FilaFiltros>
            <ChipFiltro etiqueta="TODOS" activo={!categoriaFiltro} onPress={() => setCategoriaFiltro('')} />
            {categorias.map((categoria) => (
              <ChipFiltro
                key={idDe(categoria)}
                etiqueta={categoria.name.toUpperCase()}
                activo={categoriaFiltro === idDe(categoria)}
                onPress={() => setCategoriaFiltro(idDe(categoria))}
              />
            ))}
            <ChipFiltro
              etiqueta="EN CARTA"
              activo={disponibilidad === 'carta'}
              onPress={() => setDisponibilidad((prev) => (prev === 'carta' ? 'all' : 'carta'))}
            />
            <ChipFiltro
              etiqueta="OCULTOS"
              activo={disponibilidad === 'oculto'}
              onPress={() => setDisponibilidad((prev) => (prev === 'oculto' ? 'all' : 'oculto'))}
            />
          </FilaFiltros>
        ) : null}

        {lista.length === 0 ? (
          <EstadoVacioAdmin
            icono="restaurant-outline"
            titulo="Sin platos"
            texto="La carta todavía no tiene platos en el servidor. Usa Agregar para crear el primero."
          />
        ) : vista === 'lista' ? (
          <View>
            <EncabezadoTabla
              columnas={[
                { texto: 'PLATO', flex: 1.4 },
                { texto: 'CARTA', ancho: 78 },
                { texto: 'PRECIO', ancho: 82, derecha: true },
              ]}
            />
            {lista.map((producto) => (
              <FilaTabla key={idDe(producto)}>
                <CeldaTabla flex={1.4}>
                  <View className="flex-row items-center">
                    <FotoCarta uri={producto.imageUrl} alto={48} redonda />
                    <View className="ml-2 flex-1">
                      <Text className="text-sm font-light text-white" numberOfLines={1}>
                        {producto.name}
                      </Text>
                      <AccionesCarta
                        onEditar={() => abrir(producto)}
                        onAlternar={() => void alternar(producto)}
                        onEliminar={() => borrar(producto)}
                        etiquetaAlternar={producto.available === false ? 'ACTIVAR' : 'OCULTAR'}
                      />
                    </View>
                  </View>
                </CeldaTabla>
                <CeldaTabla ancho={78}>
                  <Text className="text-[11px] text-crema/60" numberOfLines={2}>
                    {nombreCategoria(producto.categoryId)}
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
            {lista.map((producto) => (
              <View key={idDe(producto)} className="mb-5 w-[48%] border border-oro/20 bg-marca/30">
                <FotoCarta uri={producto.imageUrl} alto={132} ancha />
                <View className="px-3 py-3">
                  <Text className="text-[10px] tracking-[1px] text-oro">{nombreCategoria(producto.categoryId).toUpperCase()}</Text>
                  <Text className="mt-1 text-base font-light text-white" numberOfLines={2}>
                    {producto.name}
                  </Text>
                  <Text className="mt-2 text-lg text-oro">{formatCOP(producto.price || 0)}</Text>
                  <Text className="mt-1 text-[10px] tracking-[1px] text-crema/45">
                    {producto.available === false ? 'OCULTO' : 'EN CARTA'}
                  </Text>
                  <AccionesCarta
                    onEditar={() => abrir(producto)}
                    onAlternar={() => void alternar(producto)}
                    onEliminar={() => borrar(producto)}
                    etiquetaAlternar={producto.available === false ? 'ACTIVAR' : 'OCULTAR'}
                  />
                </View>
              </View>
            ))}
          </GrillaAdmin>
        )}
      </TarjetaPerfil>

      <ModalAdmin visible={abierto} titulo={editando ? 'Editar plato' : 'Nuevo plato'} onCerrar={() => setAbierto(false)}>
        <FormularioProducto
          valores={{
            name: editando?.name ?? '',
            description: editando?.description ?? '',
            price: editando ? String(editando.price) : '',
            categoryId: editando?.categoryId ?? idDe(categorias[0]),
            imageUrl: editando?.imageUrl ?? '',
          }}
          categorias={categorias}
          onCancelar={() => setAbierto(false)}
          onGuardar={guardar}
          guardando={guardando}
        />
      </ModalAdmin>
    </View>
  );
}
