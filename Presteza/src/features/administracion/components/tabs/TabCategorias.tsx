import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import CampoBusqueda from '@/components/CampoBusqueda';
import { TarjetaPerfil } from '@/features/perfil/components/TarjetaPerfil';

import type { CategoriaAdmin, CategoriaForm } from '../../types';
import { idDe } from '../../utils';
import { EstadoVacioAdmin, ModalAdmin } from '../elementos';
import { FormularioCategoria } from '../formularios/FormularioCategoria';
import { AccionesCarta, CeldaTabla, EncabezadoTabla, FilaTabla, FotoCarta, InterruptorVista } from '../VistaCarta';

type TabCategoriasProps = {
  categorias: CategoriaAdmin[];
  guardando?: boolean;
  onGuardar: (datos: CategoriaForm, editando?: CategoriaAdmin | null) => Promise<boolean>;
  onEliminar: (categoria: CategoriaAdmin) => void;
};

export function TabCategorias({ categorias, guardando, onGuardar, onEliminar }: TabCategoriasProps) {
  const [busqueda, setBusqueda] = useState('');
  const [vista, setVista] = useState<'lista' | 'cuadricula'>('cuadricula');
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState<CategoriaAdmin | null>(null);

  const lista = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return categorias;
    return categorias.filter(
      (categoria) =>
        categoria.name.toLowerCase().includes(texto) || (categoria.description ?? '').toLowerCase().includes(texto),
    );
  }, [busqueda, categorias]);

  const abrir = (categoria?: CategoriaAdmin) => {
    setEditando(categoria ?? null);
    setAbierto(true);
  };

  const guardar = async (datos: CategoriaForm) => {
    if (await onGuardar(datos, editando)) setAbierto(false);
  };

  return (
    <View>
      <TarjetaPerfil
        numero="I"
        badge="CARTA"
        titulo="Categorías"
        accion={{ etiqueta: 'AGREGAR', onPress: () => abrir() }}>
        <CampoBusqueda
          value={busqueda}
          onChangeText={setBusqueda}
          placeholder="Buscar categoría..."
          variant="oscuro"
        />
        <InterruptorVista vista={vista} onChange={setVista} />
        <Text className="mb-4 text-sm text-crema/55">{lista.length} en la carta</Text>

        {lista.length === 0 ? (
          <EstadoVacioAdmin icono="grid-outline" titulo="Sin categorías" texto="Crea las secciones de la carta." />
        ) : vista === 'lista' ? (
          <View>
            <EncabezadoTabla
              columnas={[
                { texto: 'SECCIÓN', flex: 1.1 },
                { texto: 'NOTA', flex: 1 },
              ]}
            />
            {lista.map((categoria) => (
              <FilaTabla key={idDe(categoria)}>
                <CeldaTabla flex={1.1}>
                  <View className="flex-row items-center">
                    <FotoCarta uri={categoria.imageUrl} alto={48} />
                    <View className="ml-2 flex-1">
                      <Text className="text-sm font-light text-white" numberOfLines={2}>
                        {categoria.name}
                      </Text>
                      <AccionesCarta onEditar={() => abrir(categoria)} onEliminar={() => onEliminar(categoria)} />
                    </View>
                  </View>
                </CeldaTabla>
                <CeldaTabla flex={1}>
                  <Text className="text-sm text-crema/55" numberOfLines={3}>
                    {categoria.description || 'Sin nota'}
                  </Text>
                </CeldaTabla>
              </FilaTabla>
            ))}
          </View>
        ) : (
          <View className="flex-row flex-wrap justify-between">
            {lista.map((categoria) => (
              <View key={idDe(categoria)} className="mb-5 w-[48%] overflow-hidden border border-oro/25">
                <View className="relative">
                  <FotoCarta uri={categoria.imageUrl} alto={168} ancha />
                  <View className="absolute bottom-0 left-0 right-0 bg-marca-oscura/80 px-3 py-3">
                    <Text className="text-[10px] tracking-[2px] text-oro">SECCIÓN</Text>
                    <Text className="mt-1 text-xl font-light text-white">{categoria.name}</Text>
                  </View>
                </View>
                <View className="bg-marca/40 px-3 py-3">
                  <Text className="text-sm text-crema/60" numberOfLines={2}>
                    {categoria.description || 'Sin nota'}
                  </Text>
                  <AccionesCarta onEditar={() => abrir(categoria)} onEliminar={() => onEliminar(categoria)} />
                </View>
              </View>
            ))}
          </View>
        )}
      </TarjetaPerfil>

      <ModalAdmin visible={abierto} titulo={editando ? 'Editar categoría' : 'Nueva categoría'} onCerrar={() => setAbierto(false)}>
        <FormularioCategoria
          key={idDe(editando) || 'nueva'}
          valores={{
            name: editando?.name ?? '',
            description: editando?.description ?? '',
            imageUrl: editando?.imageUrl ?? '',
          }}
          onCancelar={() => setAbierto(false)}
          onGuardar={guardar}
          guardando={guardando}
        />
      </ModalAdmin>
    </View>
  );
}
