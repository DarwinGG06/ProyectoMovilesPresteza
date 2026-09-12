import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { TarjetaPerfil } from '@/features/perfil/components/TarjetaPerfil';
import { formatCOP } from '@/services/cart/CartContext';

import type { AdicionalAdmin, AdicionalForm } from '../../types';
import { idDe } from '../../utils';
import { AccionesAdmin, ChipFiltro, EnlaceAdmin, EstadoVacioAdmin, ModalAdmin } from '../elementos';
import { FormularioAdicional } from '../formularios/FormularioAdicional';
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

type TabAdicionalesProps = {
  adicionales: AdicionalAdmin[];
  guardando?: boolean;
  onGuardar: (datos: AdicionalForm, editando?: AdicionalAdmin | null) => Promise<boolean>;
  onAlternar: (adicional: AdicionalAdmin) => void;
  onEliminar: (adicional: AdicionalAdmin) => void;
};

export function TabAdicionales({ adicionales, guardando, onGuardar, onAlternar, onEliminar }: TabAdicionalesProps) {
  const [filtro, setFiltro] = useState<'all' | 'on' | 'off'>('all');
  const [vista, setVista] = useState<'lista' | 'cuadricula'>('lista');
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(true);
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState<AdicionalAdmin | null>(null);

  const lista = useMemo(() => {
    if (filtro === 'on') return adicionales.filter((item) => item.available !== false);
    if (filtro === 'off') return adicionales.filter((item) => item.available === false);
    return adicionales;
  }, [adicionales, filtro]);

  const guardar = async (datos: AdicionalForm) => {
    if (await onGuardar(datos, editando)) setAbierto(false);
  };

  return (
    <View>
      <TarjetaPerfil
        numero="I"
        badge="EXTRAS"
        titulo="Adicionales"
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
            <ChipFiltro etiqueta="DISPONIBLES" activo={filtro === 'on'} onPress={() => setFiltro('on')} />
            <ChipFiltro etiqueta="OCULTOS" activo={filtro === 'off'} onPress={() => setFiltro('off')} />
          </FilaFiltros>
        ) : null}

        {lista.length === 0 ? (
          <EstadoVacioAdmin icono="add-circle-outline" titulo="Sin adicionales" texto="Crea extras para personalizar los platos." />
        ) : vista === 'lista' ? (
          <View>
            <EncabezadoTabla
              columnas={[
                { texto: 'EXTRA', flex: 1.3 },
                { texto: 'ESTADO', ancho: 78 },
                { texto: 'PRECIO', ancho: 82, derecha: true },
              ]}
            />
            {lista.map((adicional) => (
              <FilaTabla key={idDe(adicional)}>
                <CeldaTabla flex={1.3}>
                  <Text className="text-sm font-light text-white" numberOfLines={2}>
                    {adicional.name}
                  </Text>
                  <AccionesAdmin>
                    <EnlaceAdmin etiqueta="EDITAR" onPress={() => { setEditando(adicional); setAbierto(true); }} />
                    <EnlaceAdmin
                      etiqueta={adicional.available === false ? 'ACTIVAR' : 'OCULTAR'}
                      onPress={() => onAlternar(adicional)}
                    />
                    <EnlaceAdmin etiqueta="ELIMINAR" peligro onPress={() => onEliminar(adicional)} />
                  </AccionesAdmin>
                </CeldaTabla>
                <CeldaTabla ancho={78}>
                  <Text className="text-[10px] tracking-[1px] text-oro">
                    {adicional.available === false ? 'OCULTO' : 'ACTIVO'}
                  </Text>
                </CeldaTabla>
                <CeldaTabla ancho={82} derecha>
                  <Text className="text-right text-sm text-oro">{formatCOP(adicional.price || 0)}</Text>
                </CeldaTabla>
              </FilaTabla>
            ))}
          </View>
        ) : (
          <GrillaAdmin>
            {lista.map((adicional) => (
              <CajaCuadricula key={idDe(adicional)}>
                <Text className="text-[10px] tracking-[1px] text-oro">
                  {adicional.available === false ? 'OCULTO' : 'DISPONIBLE'}
                </Text>
                <Text className="mt-1 text-base font-light text-white" numberOfLines={2}>
                  {adicional.name}
                </Text>
                <Text className="mt-2 text-lg text-oro">{formatCOP(adicional.price || 0)}</Text>
                <AccionesCarta
                  onEditar={() => {
                    setEditando(adicional);
                    setAbierto(true);
                  }}
                  onAlternar={() => onAlternar(adicional)}
                  onEliminar={() => onEliminar(adicional)}
                  etiquetaAlternar={adicional.available === false ? 'ACTIVAR' : 'OCULTAR'}
                />
              </CajaCuadricula>
            ))}
          </GrillaAdmin>
        )}
      </TarjetaPerfil>

      <ModalAdmin visible={abierto} titulo={editando ? 'Editar adicional' : 'Nuevo adicional'} onCerrar={() => setAbierto(false)}>
        <FormularioAdicional
          valores={{ name: editando?.name ?? '', price: editando ? String(editando.price) : '' }}
          onCancelar={() => setAbierto(false)}
          onGuardar={guardar}
          guardando={guardando}
        />
      </ModalAdmin>
    </View>
  );
}
