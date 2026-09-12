import { useState } from 'react';
import { Text, View } from 'react-native';

import { TarjetaPerfil } from '@/features/perfil/components/TarjetaPerfil';
import { useAviso } from '@/shared/components/aviso';

import { actualizarCategoria, crearCategoria, eliminarCategoria } from '../../api/adminApi';
import type { CategoriaAdmin, CategoriaForm } from '../../types';
import { idDe } from '../../utils';
import { EstadoVacioAdmin, ModalAdmin } from '../elementos';
import { FormularioCategoria } from '../formularios/FormularioCategoria';
import { AccionesCarta, CeldaTabla, EncabezadoTabla, FilaTabla, FotoCarta, InterruptorVista } from '../VistaCarta';

type TabCategoriasProps = {
  token: string;
  categorias: CategoriaAdmin[];
  setCategorias: (categorias: CategoriaAdmin[]) => void;
};

export function TabCategorias({ token, categorias, setCategorias }: TabCategoriasProps) {
  const [vista, setVista] = useState<'lista' | 'cuadricula'>('cuadricula');
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState<CategoriaAdmin | null>(null);
  const [guardando, setGuardando] = useState(false);
  const aviso = useAviso();

  const abrir = (categoria?: CategoriaAdmin) => {
    setEditando(categoria ?? null);
    setAbierto(true);
  };

  const guardar = async (datos: CategoriaForm) => {
    setGuardando(true);
    try {
      const cuerpo = {
        name: datos.name.trim(),
        description: datos.description.trim(),
        imageUrl: datos.imageUrl.trim(),
      };
      if (editando) {
        const actualizado = await actualizarCategoria(token, idDe(editando), cuerpo);
        setCategorias(categorias.map((item) => (idDe(item) === idDe(editando) ? { ...item, ...actualizado, ...cuerpo } : item)));
        aviso.ok('Categoría editada', `${cuerpo.name} fue editada.`);
      } else {
        setCategorias([await crearCategoria(token, cuerpo), ...categorias]);
        aviso.ok('Categoría creada', `${cuerpo.name} ya está en la carta.`);
      }
      setAbierto(false);
    } catch (err) {
      aviso.errorDe(err, 'No se pudo guardar.', 'Categoría');
    } finally {
      setGuardando(false);
    }
  };

  const borrar = (categoria: CategoriaAdmin) => {
    aviso.confirmar({
      sello: 'CARTA',
      titulo: 'Eliminar categoría',
      texto: `¿Quitar ${categoria.name} de la carta?`,
      confirmar: 'ELIMINAR',
      peligro: true,
      exito: {
        titulo: 'Categoría eliminada',
        texto: `${categoria.name} fue eliminada.`,
      },
      onConfirmar: async () => {
        await eliminarCategoria(token, idDe(categoria));
        setCategorias(categorias.filter((item) => idDe(item) !== idDe(categoria)));
      },
    });
  };

  return (
    <View>
      <TarjetaPerfil
        numero="I"
        badge="CARTA"
        titulo="Categorías"
        accion={{ etiqueta: 'AGREGAR', onPress: () => abrir() }}>
        <InterruptorVista vista={vista} onChange={setVista} />
        <Text className="mb-4 text-sm text-crema/55">{categorias.length} en la carta</Text>

        {categorias.length === 0 ? (
          <EstadoVacioAdmin icono="grid-outline" titulo="Sin categorías" texto="Crea las secciones de la carta." />
        ) : vista === 'lista' ? (
          <View>
            <EncabezadoTabla
              columnas={[
                { texto: 'SECCIÓN', flex: 1.1 },
                { texto: 'NOTA', flex: 1 },
              ]}
            />
            {categorias.map((categoria) => (
              <FilaTabla key={idDe(categoria)}>
                <CeldaTabla flex={1.1}>
                  <View className="flex-row items-center">
                    <FotoCarta uri={categoria.imageUrl} alto={48} />
                    <View className="ml-2 flex-1">
                      <Text className="text-sm font-light text-white" numberOfLines={2}>
                        {categoria.name}
                      </Text>
                      <AccionesCarta onEditar={() => abrir(categoria)} onEliminar={() => borrar(categoria)} />
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
            {categorias.map((categoria) => (
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
                  <AccionesCarta onEditar={() => abrir(categoria)} onEliminar={() => borrar(categoria)} />
                </View>
              </View>
            ))}
          </View>
        )}
      </TarjetaPerfil>

      <ModalAdmin visible={abierto} titulo={editando ? 'Editar categoría' : 'Nueva categoría'} onCerrar={() => setAbierto(false)}>
        <FormularioCategoria
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
