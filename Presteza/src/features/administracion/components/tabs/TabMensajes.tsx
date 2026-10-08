import { Text, View } from 'react-native';

import { TarjetaPerfil } from '@/features/perfil/components/TarjetaPerfil';

import { useTabMensajes } from '../../hooks/useTabMensajes';
import type { MensajeAdmin, MensajeForm } from '../../types';
import { formatoFechaHora, idDe } from '../../utils';
import { AccionesAdmin, EnlaceAdmin, EstadoVacioAdmin, ModalAdmin } from '../elementos';
import { FormularioMensaje } from '../formularios/FormularioMensaje';
import {
  CajaCuadricula,
  CeldaTabla,
  EncabezadoTabla,
  FilaTabla,
  GrillaAdmin,
  InterruptorVista,
} from '../VistaCarta';

type TabMensajesProps = {
  mensajes: MensajeAdmin[];
  guardando?: boolean;
  onGuardar: (datos: MensajeForm, editando?: MensajeAdmin | null) => Promise<boolean>;
  onEliminar: (mensaje: MensajeAdmin) => void;
};

export function TabMensajes({ mensajes, guardando, onGuardar, onEliminar }: TabMensajesProps) {
  const tab = useTabMensajes(mensajes, onGuardar);

  const lista = useMemo(
    () =>
      [...mensajes].sort(
        (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      ),
    [mensajes]
  );

  return (
    <View>
      <TarjetaPerfil
        numero="I"
        badge="CORREO"
        titulo="Mensajes"
        accion={{ etiqueta: 'AGREGAR', onPress: () => tab.abrir() }}>
        <InterruptorVista vista={tab.vista} onChange={tab.setVista} />

        {lista.length === 0 ? (
          <EstadoVacioAdmin
            icono="mail-outline"
            titulo="Sin mensajes"
            texto="Crea uno o espera a que escriban."
          />
        ) : vista === 'lista' ? (
          <View>
            <EncabezadoTabla
              columnas={[
                { texto: 'ASUNTO', flex: 1.2 },
                { texto: 'DE', flex: 0.8 },
              ]}
            />
            {tab.lista.map((mensaje) => (
              <FilaTabla key={idDe(mensaje)}>
                <CeldaTabla flex={1.2}>
                  <Text className="font-roboto-light text-sm text-white" numberOfLines={2}>
                    {mensaje.subject}
                  </Text>
                  {acciones(mensaje)}
                </CeldaTabla>
                <CeldaTabla flex={0.8}>
                  <Text className="font-roboto text-sm text-crema/70" numberOfLines={1}>
                    {mensaje.name}
                  </Text>
                  <Text className="mt-0.5 font-roboto text-[11px] text-crema/40" numberOfLines={1}>
                    {formatoFechaHora(mensaje.createdAt)}
                  </Text>
                </CeldaTabla>
              </FilaTabla>
            ))}
          </View>
        ) : (
          <GrillaAdmin>
            {tab.lista.map((mensaje) => (
              <CajaCuadricula key={idDe(mensaje)}>
                <Text className="font-roboto-light text-base text-white" numberOfLines={2}>
                  {mensaje.subject}
                </Text>
                <Text className="mt-1 font-roboto text-sm text-crema/70" numberOfLines={1}>
                  {mensaje.name}
                </Text>
                <Text className="mt-2 font-roboto text-sm text-crema/50" numberOfLines={3}>
                  {mensaje.message}
                </Text>
                {acciones(mensaje)}
              </CajaCuadricula>
            ))}
          </GrillaAdmin>
        )}
      </TarjetaPerfil>

      <ModalAdmin
        visible={abierto}
        titulo={editando ? 'Editar mensaje' : 'Nuevo mensaje'}
        onCerrar={() => setAbierto(false)}>
        <FormularioMensaje
          key={tab.editando ? idDe(tab.editando) : 'nuevo'}
          valores={tab.valoresFormulario}
          onCancelar={tab.cerrar}
          onGuardar={tab.guardar}
          guardando={guardando}
        />
      </ModalAdmin>

      <ModalAdmin
        visible={Boolean(detalle)}
        titulo={detalle?.subject || 'Mensaje'}
        onCerrar={() => setDetalle(null)}>
        {detalle ? (
          <View className="gap-3">
            <Text className="font-roboto text-base text-marca-oscura">{detalle.name}</Text>
            <Text className="font-roboto text-sm text-texto/70">{detalle.email}</Text>
            {detalle.phone ? (
              <Text className="font-roboto text-sm text-texto/70">{detalle.phone}</Text>
            ) : null}
            <Text className="font-roboto text-sm text-texto/55">
              {formatoFechaHora(detalle.createdAt)}
            </Text>
            <Text className="mt-2 font-roboto text-base leading-6 text-marca-oscura">
              {detalle.message}
            </Text>
            <AccionesAdmin>
              <EnlaceAdmin
                etiqueta="EDITAR"
                onPress={() => {
                  setDetalle(null);
                  abrir(detalle);
                }}
              />
              <EnlaceAdmin etiqueta="ELIMINAR" peligro onPress={() => onEliminar(detalle)} />
            </AccionesAdmin>
          </View>
        ) : null}
      </ModalAdmin>
    </View>
  );
}
