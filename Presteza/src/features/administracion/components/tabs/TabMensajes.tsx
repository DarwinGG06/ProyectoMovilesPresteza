import { Pressable, Text, View } from 'react-native';

import Button from '@/components/Button';
import { TarjetaPerfil } from '@/features/perfil/components/TarjetaPerfil';

import { useTabMensajes } from '../../hooks/useTabMensajes';
import type { MensajeAdmin, MensajeForm } from '../../types';
import { formatoFechaHora, idDe } from '../../utils';
import {
  AccionesAdmin,
  BotonAgregarAdmin,
  EnlaceAdmin,
  EstadoVacioAdmin,
  ModalAdmin,
} from '../elementos';
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

  const acciones = (mensaje: MensajeAdmin) => (
    <AccionesAdmin>
      <EnlaceAdmin etiqueta="VER" onPress={() => tab.verDetalle(mensaje)} />
      <EnlaceAdmin etiqueta="EDITAR" onPress={() => tab.abrir(mensaje)} />
      <EnlaceAdmin etiqueta="ELIMINAR" peligro onPress={() => onEliminar(mensaje)} />
    </AccionesAdmin>
  );

  return (
    <View>
      <TarjetaPerfil compacto numero="I" badge="CORREO" titulo="Mensajes">
        <BotonAgregarAdmin onPress={() => tab.abrir()} />
        <InterruptorVista vista={tab.vista} onChange={tab.setVista} />

        {tab.lista.length === 0 ? (
          <EstadoVacioAdmin
            icono="mail-outline"
            titulo="Sin mensajes"
            texto="Crea uno o espera a que escriban."
          />
        ) : tab.vista === 'lista' ? (
          <View>
            <EncabezadoTabla
              columnas={[
                { texto: 'ASUNTO', flex: 1.2 },
                { texto: 'DE', flex: 0.8 },
              ]}
            />
            {tab.lista.map((mensaje) => (
              <FilaTabla key={idDe(mensaje)} onPress={() => tab.verDetalle(mensaje)}>
                <CeldaTabla flex={1.2}>
                  <Text className="font-roboto-light text-sm text-tinta" numberOfLines={2}>
                    {mensaje.subject}
                  </Text>
                  {acciones(mensaje)}
                </CeldaTabla>
                <CeldaTabla flex={0.8}>
                  <Text className="font-roboto text-sm text-tinta/70" numberOfLines={1}>
                    {mensaje.name}
                  </Text>
                  <Text className="mt-0.5 font-roboto text-[13px] text-tinta/70" numberOfLines={1}>
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
                <Text className="font-roboto-light text-base text-tinta" numberOfLines={2}>
                  {mensaje.subject}
                </Text>
                <Text className="mt-1 font-roboto text-sm text-tinta/70" numberOfLines={1}>
                  {mensaje.name}
                </Text>
                <Text className="mt-2 font-roboto text-sm text-tinta/70" numberOfLines={3}>
                  {mensaje.message}
                </Text>
                {acciones(mensaje)}
              </CajaCuadricula>
            ))}
          </GrillaAdmin>
        )}
      </TarjetaPerfil>

      <ModalAdmin
        compacto
        visible={tab.abierto}
        titulo={tab.editando ? 'Editar mensaje' : 'Nuevo mensaje'}
        onCerrar={tab.cerrar}>
        <FormularioMensaje
          key={tab.editando ? idDe(tab.editando) : 'nuevo'}
          valores={tab.valoresFormulario}
          onCancelar={tab.cerrar}
          onGuardar={tab.guardar}
          guardando={guardando}
        />
      </ModalAdmin>

      <ModalAdmin
        compacto
        visible={Boolean(tab.detalle)}
        titulo={tab.detalle?.subject || 'Mensaje'}
        onCerrar={tab.cerrarDetalle}>
        {tab.detalle ? (
          <View>
            <Text className="font-roboto text-[15px] text-tinta">{tab.detalle.name}</Text>
            <Text className="mt-1 font-roboto text-[13px] text-tinta/70">{tab.detalle.email}</Text>
            {tab.detalle.phone ? (
              <Text className="mt-0.5 font-roboto text-[13px] text-tinta/70">{tab.detalle.phone}</Text>
            ) : null}
            <Text className="mt-1 font-roboto text-[13px] text-tinta/55">
              {formatoFechaHora(tab.detalle.createdAt)}
            </Text>
            <View className="my-4 h-px bg-madera/20" />
            <Text className="font-roboto text-[15px] leading-6 text-tinta">{tab.detalle.message}</Text>
            <View className="mt-5 flex-row gap-2">
              <Button
                text="EDITAR"
                variant="secondary"
                compact
                className="flex-1"
                onPress={tab.editarDesdeDetalle}
              />
              <Pressable
                onPress={() => tab.detalle && onEliminar(tab.detalle)}
                accessibilityRole="button"
                className="min-h-12 flex-1 items-center justify-center border border-red-600/45">
                <Text className="font-roboto text-[13px] tracking-[2px] text-red-700">ELIMINAR</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </ModalAdmin>
    </View>
  );
}
