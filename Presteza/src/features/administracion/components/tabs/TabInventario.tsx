import { Text, View } from 'react-native';

import { TarjetaPerfil } from '@/features/perfil/components/TarjetaPerfil';
import { formatCOP } from '@/services/cart/CartContext';

import { useTabInventario } from '../../hooks/useTabInventario';
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

type TabInventarioProps = {
  insumos: InsumoAdmin[];
  guardando?: boolean;
  onGuardar: (datos: InsumoForm, editando?: InsumoAdmin | null) => Promise<boolean>;
  onEliminar: (insumo: InsumoAdmin) => void;
};

export function TabInventario({ insumos, guardando, onGuardar, onEliminar }: TabInventarioProps) {
  const tab = useTabInventario(insumos, onGuardar);

  return (
    <View>
      <TarjetaPerfil
        numero="I"
        badge="BODEGA"
        titulo="Inventario"
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
              etiqueta="BAJO"
              activo={tab.filtro === 'low'}
              onPress={() => tab.setFiltro('low')}
            />
            <ChipFiltro
              etiqueta="AGOTADOS"
              activo={tab.filtro === 'out'}
              onPress={() => tab.setFiltro('out')}
            />
          </FilaFiltros>
        ) : null}

        {tab.lista.length === 0 ? (
          <EstadoVacioAdmin
            icono="cube-outline"
            titulo="Sin insumos"
            texto="Registra lo que entra a la cocina."
          />
        ) : tab.vista === 'lista' ? (
          <View>
            <EncabezadoTabla
              columnas={[
                { texto: 'INSUMO', flex: 1.3 },
                { texto: 'STOCK', ancho: 56, derecha: true },
                { texto: 'PRECIO', ancho: 82, derecha: true },
              ]}
            />
            {tab.lista.map((insumo) => (
              <FilaTabla key={idDe(insumo)}>
                <CeldaTabla flex={1.3}>
                  <Text className="font-roboto-light text-sm text-white" numberOfLines={1}>
                    {insumo.name}
                  </Text>
                  <Text className="mt-0.5 font-roboto text-[11px] text-crema/45" numberOfLines={1}>
                    {tab.sello(insumo.quantity)}
                  </Text>
                  <AccionesAdmin>
                    <EnlaceAdmin etiqueta="EDITAR" onPress={() => tab.abrir(insumo)} />
                    <EnlaceAdmin etiqueta="ELIMINAR" peligro onPress={() => onEliminar(insumo)} />
                  </AccionesAdmin>
                </CeldaTabla>
                <CeldaTabla ancho={56} derecha>
                  <Text className="text-right font-roboto text-sm text-crema">
                    {insumo.quantity}
                  </Text>
                </CeldaTabla>
                <CeldaTabla ancho={82} derecha>
                  <Text className="text-right font-roboto text-sm text-oro">
                    {formatCOP(insumo.unit_price || 0)}
                  </Text>
                </CeldaTabla>
              </FilaTabla>
            ))}
          </View>
        ) : (
          <GrillaAdmin>
            {tab.lista.map((insumo) => (
              <CajaCuadricula key={idDe(insumo)}>
                <Text className="font-roboto text-[10px] tracking-[1px] text-oro">
                  {tab.sello(insumo.quantity)}
                </Text>
                <Text className="mt-1 font-roboto-light text-base text-white" numberOfLines={2}>
                  {insumo.name}
                </Text>
                <Text className="mt-2 font-roboto-light text-2xl text-oro">{insumo.quantity}</Text>
                <Text className="font-roboto text-[11px] text-crema/50">
                  {formatCOP(insumo.unit_price || 0)} / ud
                </Text>
                <AccionesCarta
                  onEditar={() => tab.abrir(insumo)}
                  onEliminar={() => onEliminar(insumo)}
                />
              </CajaCuadricula>
            ))}
          </GrillaAdmin>
        )}
      </TarjetaPerfil>

      <ModalAdmin
        visible={tab.abierto}
        titulo={tab.editando ? 'Editar insumo' : 'Nuevo insumo'}
        onCerrar={tab.cerrar}>
        <FormularioInsumo
          valores={tab.valoresFormulario}
          onCancelar={tab.cerrar}
          onGuardar={tab.guardar}
          guardando={guardando}
        />
      </ModalAdmin>
    </View>
  );
}
