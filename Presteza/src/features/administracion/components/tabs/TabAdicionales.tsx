import { Text, View } from 'react-native';

import { TarjetaPerfil } from '@/features/perfil/components/TarjetaPerfil';
import { formatCOP } from '@/services/cart/CartContext';

import { useTabAdicionales } from '../../hooks/useTabAdicionales';
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

export function TabAdicionales({
  adicionales,
  guardando,
  onGuardar,
  onAlternar,
  onEliminar,
}: TabAdicionalesProps) {
  const tab = useTabAdicionales(adicionales, onGuardar);

  return (
    <View>
      <TarjetaPerfil
        numero="I"
        badge="EXTRAS"
        titulo="Adicionales"
        accion={{ etiqueta: 'AGREGAR', onPress: () => tab.abrir() }}>
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
              activo={tab.filtro === 'all'}
              onPress={() => tab.setFiltro('all')}
            />
            <ChipFiltro
              etiqueta="DISPONIBLES"
              activo={tab.filtro === 'on'}
              onPress={() => tab.setFiltro('on')}
            />
            <ChipFiltro
              etiqueta="OCULTOS"
              activo={tab.filtro === 'off'}
              onPress={() => tab.setFiltro('off')}
            />
          </FilaFiltros>
        ) : null}

        {tab.lista.length === 0 ? (
          <EstadoVacioAdmin
            icono="add-circle-outline"
            titulo="Sin adicionales"
            texto="Crea extras para personalizar los platos."
          />
        ) : tab.vista === 'lista' ? (
          <View>
            <EncabezadoTabla
              columnas={[
                { texto: 'EXTRA', flex: 1.3 },
                { texto: 'ESTADO', ancho: 78 },
                { texto: 'PRECIO', ancho: 82, derecha: true },
              ]}
            />
            {tab.lista.map((adicional) => (
              <FilaTabla key={idDe(adicional)}>
                <CeldaTabla flex={1.3}>
                  <Text className="font-roboto-light text-sm text-white" numberOfLines={2}>
                    {adicional.name}
                  </Text>
                  <AccionesAdmin>
                    <EnlaceAdmin etiqueta="EDITAR" onPress={() => tab.abrir(adicional)} />
                    <EnlaceAdmin
                      etiqueta={adicional.available === false ? 'ACTIVAR' : 'OCULTAR'}
                      onPress={() => onAlternar(adicional)}
                    />
                    <EnlaceAdmin
                      etiqueta="ELIMINAR"
                      peligro
                      onPress={() => onEliminar(adicional)}
                    />
                  </AccionesAdmin>
                </CeldaTabla>
                <CeldaTabla ancho={78}>
                  <Text className="font-roboto text-[10px] tracking-[1px] text-oro">
                    {adicional.available === false ? 'OCULTO' : 'ACTIVO'}
                  </Text>
                </CeldaTabla>
                <CeldaTabla ancho={82} derecha>
                  <Text className="text-right font-roboto text-sm text-oro">
                    {formatCOP(adicional.price || 0)}
                  </Text>
                </CeldaTabla>
              </FilaTabla>
            ))}
          </View>
        ) : (
          <GrillaAdmin>
            {tab.lista.map((adicional) => (
              <CajaCuadricula key={idDe(adicional)}>
                <Text className="font-roboto text-[10px] tracking-[1px] text-oro">
                  {adicional.available === false ? 'OCULTO' : 'DISPONIBLE'}
                </Text>
                <Text className="mt-1 font-roboto-light text-base text-white" numberOfLines={2}>
                  {adicional.name}
                </Text>
                <Text className="mt-2 font-roboto text-lg text-oro">
                  {formatCOP(adicional.price || 0)}
                </Text>
                <AccionesCarta
                  onEditar={() => tab.abrir(adicional)}
                  onAlternar={() => onAlternar(adicional)}
                  onEliminar={() => onEliminar(adicional)}
                  etiquetaAlternar={adicional.available === false ? 'ACTIVAR' : 'OCULTAR'}
                />
              </CajaCuadricula>
            ))}
          </GrillaAdmin>
        )}
      </TarjetaPerfil>

      <ModalAdmin
        visible={tab.abierto}
        titulo={tab.editando ? 'Editar adicional' : 'Nuevo adicional'}
        onCerrar={tab.cerrar}>
        <FormularioAdicional
          valores={tab.valoresFormulario}
          onCancelar={tab.cerrar}
          onGuardar={tab.guardar}
          guardando={guardando}
        />
      </ModalAdmin>
    </View>
  );
}
