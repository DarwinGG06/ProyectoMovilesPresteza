import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { TarjetaPerfil } from '@/features/perfil/components/TarjetaPerfil';
import { formatCOP } from '@/services/cart/CartContext';
import { useAviso } from '@/shared/components/aviso';

import { actualizarInsumo, crearInsumo, eliminarInsumo } from '../../api/adminApi';
import type { InsumoAdmin, InsumoForm } from '../../types';
import { idDe } from '../../utils';
import { AccionesAdmin, ChipFiltro, EnlaceAdmin, EstadoVacioAdmin, ModalAdmin } from '../elementos';
import { FormularioInsumo } from '../formularios/FormularioInsumo';
import {
  AccionesCarta,
  CajaCuadricula,
  CeldaTabla,
  EncabezadoTabla,
  FilaFiltros,
  FilaTabla,
  GrillaAdmin,
  InterruptorVista,
} from '../VistaCarta';

const UMBRAL = 10;

type TabInventarioProps = {
  token: string;
  insumos: InsumoAdmin[];
  setInsumos: (insumos: InsumoAdmin[]) => void;
};

export function TabInventario({ token, insumos, setInsumos }: TabInventarioProps) {
  const [filtro, setFiltro] = useState<'all' | 'low' | 'out'>('all');
  const [vista, setVista] = useState<'lista' | 'cuadricula'>('lista');
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(true);
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState<InsumoAdmin | null>(null);
  const [guardando, setGuardando] = useState(false);
  const aviso = useAviso();

  const lista = useMemo(() => {
    if (filtro === 'out') return insumos.filter((item) => item.quantity === 0);
    if (filtro === 'low') return insumos.filter((item) => item.quantity > 0 && item.quantity < UMBRAL);
    return insumos;
  }, [filtro, insumos]);

  const sello = (cantidad: number) => {
    if (cantidad === 0) return 'AGOTADO';
    if (cantidad < UMBRAL) return 'BAJO';
    return 'OK';
  };

  const guardar = async (datos: InsumoForm) => {
    setGuardando(true);
    try {
      const cuerpo = {
        name: datos.name.trim(),
        description: datos.description.trim(),
        unit_price: Number(datos.unit_price),
        quantity: Number(datos.quantity),
      };
      if (editando) {
        const actualizado = await actualizarInsumo(token, idDe(editando), cuerpo);
        setInsumos(insumos.map((item) => (idDe(item) === idDe(editando) ? { ...item, ...actualizado, ...cuerpo } : item)));
        aviso.ok('Insumo editado', `${cuerpo.name} fue editado.`);
      } else {
        setInsumos([await crearInsumo(token, cuerpo), ...insumos]);
        aviso.ok('Insumo creado', `${cuerpo.name} ya está en la bodega.`);
      }
      setAbierto(false);
    } catch (err) {
      aviso.errorDe(err, 'No se pudo guardar.', 'Inventario');
    } finally {
      setGuardando(false);
    }
  };

  const borrar = (insumo: InsumoAdmin) => {
    aviso.confirmar({
      sello: 'BODEGA',
      titulo: 'Eliminar insumo',
      texto: `¿Quitar ${insumo.name} del inventario?`,
      confirmar: 'ELIMINAR',
      peligro: true,
      exito: {
        titulo: 'Insumo eliminado',
        texto: `${insumo.name} fue eliminado.`,
      },
      onConfirmar: async () => {
        await eliminarInsumo(token, idDe(insumo));
        setInsumos(insumos.filter((item) => idDe(item) !== idDe(insumo)));
      },
    });
  };

  return (
    <View>
      <TarjetaPerfil
        numero="I"
        badge="BODEGA"
        titulo="Inventario"
        accion={{ etiqueta: 'AGREGAR', onPress: () => { setEditando(null); setAbierto(true); } }}>
        <InterruptorVista
          vista={vista}
          onChange={setVista}
          filtrosAbiertos={filtrosAbiertos}
          onFiltros={() => setFiltrosAbiertos((abierto) => !abierto)}
        />
        {filtrosAbiertos ? (
          <FilaFiltros>
            <ChipFiltro etiqueta="TODOS" activo={filtro === 'all'} onPress={() => setFiltro('all')} />
            <ChipFiltro etiqueta="BAJO" activo={filtro === 'low'} onPress={() => setFiltro('low')} />
            <ChipFiltro etiqueta="AGOTADOS" activo={filtro === 'out'} onPress={() => setFiltro('out')} />
          </FilaFiltros>
        ) : null}

        {lista.length === 0 ? (
          <EstadoVacioAdmin icono="cube-outline" titulo="Sin insumos" texto="Registra lo que entra a la cocina." />
        ) : vista === 'lista' ? (
          <View>
            <EncabezadoTabla
              columnas={[
                { texto: 'INSUMO', flex: 1.3 },
                { texto: 'STOCK', ancho: 56, derecha: true },
                { texto: 'PRECIO', ancho: 82, derecha: true },
              ]}
            />
            {lista.map((insumo) => (
              <FilaTabla key={idDe(insumo)}>
                <CeldaTabla flex={1.3}>
                  <Text className="text-sm font-light text-white" numberOfLines={1}>
                    {insumo.name}
                  </Text>
                  <Text className="mt-0.5 text-[11px] text-crema/45" numberOfLines={1}>
                    {sello(insumo.quantity)}
                  </Text>
                  <AccionesAdmin>
                    <EnlaceAdmin etiqueta="EDITAR" onPress={() => { setEditando(insumo); setAbierto(true); }} />
                    <EnlaceAdmin etiqueta="ELIMINAR" peligro onPress={() => borrar(insumo)} />
                  </AccionesAdmin>
                </CeldaTabla>
                <CeldaTabla ancho={56} derecha>
                  <Text className="text-right text-sm text-crema">{insumo.quantity}</Text>
                </CeldaTabla>
                <CeldaTabla ancho={82} derecha>
                  <Text className="text-right text-sm text-oro">{formatCOP(insumo.unit_price || 0)}</Text>
                </CeldaTabla>
              </FilaTabla>
            ))}
          </View>
        ) : (
          <GrillaAdmin>
            {lista.map((insumo) => (
              <CajaCuadricula key={idDe(insumo)}>
                <Text className="text-[10px] tracking-[1px] text-oro">{sello(insumo.quantity)}</Text>
                <Text className="mt-1 text-base font-light text-white" numberOfLines={2}>
                  {insumo.name}
                </Text>
                <Text className="mt-2 text-2xl font-light text-oro">{insumo.quantity}</Text>
                <Text className="text-[11px] text-crema/50">{formatCOP(insumo.unit_price || 0)} / ud</Text>
                <AccionesCarta
                  onEditar={() => {
                    setEditando(insumo);
                    setAbierto(true);
                  }}
                  onEliminar={() => borrar(insumo)}
                />
              </CajaCuadricula>
            ))}
          </GrillaAdmin>
        )}
      </TarjetaPerfil>

      <ModalAdmin visible={abierto} titulo={editando ? 'Editar insumo' : 'Nuevo insumo'} onCerrar={() => setAbierto(false)}>
        <FormularioInsumo
          valores={{
            name: editando?.name ?? '',
            description: editando?.description ?? '',
            unit_price: editando ? String(editando.unit_price) : '',
            quantity: editando ? String(editando.quantity) : '',
          }}
          onCancelar={() => setAbierto(false)}
          onGuardar={guardar}
          guardando={guardando}
        />
      </ModalAdmin>
    </View>
  );
}
