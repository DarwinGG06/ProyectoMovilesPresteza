import { type ComponentProps, type ReactNode } from 'react';
import { Image, Pressable, Text, View } from 'react-native';

import { IconoNav } from '@/shared/components/nav-bar/IconoNav';

import { AccionesAdmin, EnlaceAdmin } from './elementos';

export type VistaAdmin = 'lista' | 'cuadricula';

type NombreIcono = ComponentProps<typeof IconoNav>['name'];

function BotonIcono({
  icono,
  etiqueta,
  activo,
  onPress,
}: {
  icono: NombreIcono;
  etiqueta: string;
  activo?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={etiqueta}
      className={`mb-2 mr-2 h-10 w-10 items-center justify-center ${activo ? 'bg-oro' : 'border border-oro/30'}`}>
      <IconoNav name={icono} size={16} className={activo ? 'text-marca-oscura' : 'text-oro'} />
    </Pressable>
  );
}

export function InterruptorVista({
  vista,
  onChange,
  filtrosAbiertos,
  onFiltros,
}: {
  vista: VistaAdmin;
  onChange: (vista: VistaAdmin) => void;
  filtrosAbiertos?: boolean;
  onFiltros?: () => void;
}) {
  return (
    <View className="mb-1 flex-row">
      {onFiltros ? (
        <BotonIcono
          icono="filter-outline"
          etiqueta="Filtros"
          activo={filtrosAbiertos}
          onPress={onFiltros}
        />
      ) : null}
      <BotonIcono
        icono="list-outline"
        etiqueta="Lista"
        activo={vista === 'lista'}
        onPress={() => onChange('lista')}
      />
      <BotonIcono
        icono="grid-outline"
        etiqueta="Cuadrícula"
        activo={vista === 'cuadricula'}
        onPress={() => onChange('cuadricula')}
      />
    </View>
  );
}

export function FilaFiltros({ children }: { children: ReactNode }) {
  return <View className="mb-3 flex-row flex-wrap items-center">{children}</View>;
}

export function GrillaAdmin({ children }: { children: ReactNode }) {
  return <View className="flex-row flex-wrap justify-between">{children}</View>;
}

export function CajaCuadricula({ children }: { children: ReactNode }) {
  return (
    <View className="mb-4 w-[48%] border border-oro/20 bg-marca/30 px-3 py-3">{children}</View>
  );
}

export type ColumnaTabla = {
  texto: string;
  flex?: number;
  ancho?: number;
  derecha?: boolean;
};

function estiloColumna(columna: { flex?: number; ancho?: number }) {
  return columna.ancho ? { width: columna.ancho } : { flex: columna.flex ?? 1 };
}

export function EncabezadoTabla({ columnas }: { columnas: ColumnaTabla[] }) {
  return (
    <View className="mb-2 flex-row items-center px-1 pb-2">
      {columnas.map((columna) => (
        <Text
          key={columna.texto}
          style={estiloColumna(columna)}
          className={`font-roboto text-[10px] tracking-[2px] text-oro/70 ${columna.derecha ? 'text-right' : ''}`}>
          {columna.texto}
        </Text>
      ))}
    </View>
  );
}

export function FilaTabla({ children }: { children: ReactNode }) {
  return (
    <View className="mb-3 border border-oro/20 bg-marca/25 px-3.5 py-3.5">
      <View className="flex-row items-center">{children}</View>
    </View>
  );
}

export function CeldaTabla({
  children,
  flex = 1,
  ancho,
  derecha,
}: {
  children: ReactNode;
  flex?: number;
  ancho?: number;
  derecha?: boolean;
}) {
  return (
    <View style={estiloColumna({ flex, ancho })} className={derecha ? 'items-end' : undefined}>
      {children}
    </View>
  );
}

export function FotoCarta({
  uri,
  alto = 88,
  redonda = false,
  ancha = false,
}: {
  uri?: string;
  alto?: number;
  redonda?: boolean;
  ancha?: boolean;
}) {
  return (
    <View
      style={{
        width: redonda || !ancha ? alto : '100%',
        height: alto,
        borderRadius: redonda ? alto / 2 : 0,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(212,175,119,0.45)',
        backgroundColor: '#2a0818',
      }}>
      {uri ? (
        <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
      ) : (
        <View className="flex-1 items-center justify-center">
          <IconoNav name="restaurant-outline" size={18} className="text-oro/50" />
        </View>
      )}
    </View>
  );
}

export function AccionesCarta({
  onEditar,
  onAlternar,
  onEliminar,
  etiquetaAlternar,
}: {
  onEditar: () => void;
  onAlternar?: () => void;
  onEliminar: () => void;
  etiquetaAlternar?: string;
}) {
  return (
    <AccionesAdmin>
      <EnlaceAdmin etiqueta="EDITAR" onPress={onEditar} />
      {onAlternar && etiquetaAlternar ? (
        <EnlaceAdmin etiqueta={etiquetaAlternar} onPress={onAlternar} />
      ) : null}
      <EnlaceAdmin etiqueta="ELIMINAR" peligro onPress={onEliminar} />
    </AccionesAdmin>
  );
}
