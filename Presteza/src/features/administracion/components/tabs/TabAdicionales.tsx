import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { TarjetaPerfil } from '@/features/perfil/components/TarjetaPerfil';
import { formatCOP } from '@/services/cart/CartContext';
import { useAviso } from '@/shared/components/aviso';

import { actualizarAdicional, crearAdicional, eliminarAdicional } from '../../api/adminApi';
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
  token: string;
  adicionales: AdicionalAdmin[];
  setAdicionales: (adicionales: AdicionalAdmin[]) => void;
};

export function TabAdicionales({ token, adicionales, setAdicionales }: TabAdicionalesProps) {
  const [filtro, setFiltro] = useState<'all' | 'on' | 'off'>('all');
  const [vista, setVista] = useState<'lista' | 'cuadricula'>('lista');
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(true);
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState<AdicionalAdmin | null>(null);
  const [guardando, setGuardando] = useState(false);
  const aviso = useAviso();

  const lista = useMemo(() => {
    if (filtro === 'on') return adicionales.filter((item) => item.available !== false);
    if (filtro === 'off') return adicionales.filter((item) => item.available === false);
    return adicionales;
  }, [adicionales, filtro]);

  const guardar = async (datos: AdicionalForm) => {
    setGuardando(true);
    try {
      const cuerpo = {
        name: datos.name.trim(),
        price: Number(datos.price),
        available: editando?.available !== false,
      };
      if (editando) {
        const actualizado = await actualizarAdicional(token, idDe(editando), cuerpo);
        setAdicionales(adicionales.map((item) => (idDe(item) === idDe(editando) ? { ...item, ...actualizado, ...cuerpo } : item)));
        aviso.ok('Adicional editado', `${cuerpo.name} fue editado.`);
      } else {
        setAdicionales([await crearAdicional(token, cuerpo), ...adicionales]);
        aviso.ok('Adicional creado', `${cuerpo.name} ya está en los extras.`);
      }
      setAbierto(false);
    } catch (err) {
      aviso.errorDe(err, 'No se pudo guardar.', 'Adicional');
    } finally {
      setGuardando(false);
    }
  };

  const alternar = async (adicional: AdicionalAdmin) => {
    try {
      const available = adicional.available === false;
      await actualizarAdicional(token, idDe(adicional), { available });
      setAdicionales(adicionales.map((item) => (idDe(item) === idDe(adicional) ? { ...item, available } : item)));
      aviso.ok(
        available ? 'Adicional activado' : 'Adicional oculto',
        available ? `${adicional.name} volvió a estar disponible.` : `${adicional.name} quedó oculto.`,
      );
    } catch (err) {
      aviso.errorDe(err, 'No se pudo actualizar.', 'Adicional');
    }
  };

  const borrar = (adicional: AdicionalAdmin) => {
    aviso.confirmar({
      sello: 'EXTRAS',
      titulo: 'Eliminar adicional',
      texto: `¿Quitar ${adicional.name} de los extras?`,
      confirmar: 'ELIMINAR',
      peligro: true,
      exito: {
        titulo: 'Adicional eliminado',
        texto: `${adicional.name} fue eliminado.`,
      },
      onConfirmar: async () => {
        await eliminarAdicional(token, idDe(adicional));
        setAdicionales(adicionales.filter((item) => idDe(item) !== idDe(adicional)));
      },
    });
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
                      onPress={() => void alternar(adicional)}
                    />
                    <EnlaceAdmin etiqueta="ELIMINAR" peligro onPress={() => borrar(adicional)} />
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
                  onAlternar={() => void alternar(adicional)}
                  onEliminar={() => borrar(adicional)}
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
