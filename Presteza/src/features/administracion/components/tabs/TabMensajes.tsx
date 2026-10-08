import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { TarjetaPerfil } from '@/features/perfil/components/TarjetaPerfil';

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

function valoresDe(mensaje?: MensajeAdmin): MensajeForm {
  return {
    name: mensaje?.name ?? '',
    email: mensaje?.email ?? '',
    phone: mensaje?.phone ?? '',
    subject: mensaje?.subject ?? '',
    message: mensaje?.message ?? '',
  };
}

export function TabMensajes({ mensajes, guardando, onGuardar, onEliminar }: TabMensajesProps) {
  const [vista, setVista] = useState<'lista' | 'cuadricula'>('lista');
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState<MensajeAdmin | null>(null);
  const [detalle, setDetalle] = useState<MensajeAdmin | null>(null);

  const lista = useMemo(
    () =>
      [...mensajes].sort(
        (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      ),
    [mensajes]
  );

  useEffect(() => {
    if (detalle && !mensajes.some((item) => idDe(item) === idDe(detalle))) setDetalle(null);
  }, [detalle, mensajes]);

  const abrir = (mensaje?: MensajeAdmin) => {
    setEditando(mensaje ?? null);
    setAbierto(true);
  };

  const guardar = async (datos: MensajeForm) => {
    if (await onGuardar(datos, editando)) setAbierto(false);
  };

  return (
    <View>
      <TarjetaPerfil
        numero="I"
        badge="CORREO"
        titulo="Mensajes"
        accion={{ etiqueta: 'AGREGAR', onPress: () => abrir() }}>
        <InterruptorVista vista={vista} onChange={setVista} />

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
            {lista.map((mensaje) => (
              <FilaTabla key={idDe(mensaje)}>
                <CeldaTabla flex={1.2}>
                  <Text className="font-roboto-light text-sm text-white" numberOfLines={2}>
                    {mensaje.subject}
                  </Text>
                  <AccionesAdmin>
                    <EnlaceAdmin etiqueta="VER" onPress={() => setDetalle(mensaje)} />
                    <EnlaceAdmin etiqueta="EDITAR" onPress={() => abrir(mensaje)} />
                    <EnlaceAdmin etiqueta="ELIMINAR" peligro onPress={() => onEliminar(mensaje)} />
                  </AccionesAdmin>
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
            {lista.map((mensaje) => (
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
                <AccionesAdmin>
                  <EnlaceAdmin etiqueta="VER" onPress={() => setDetalle(mensaje)} />
                  <EnlaceAdmin etiqueta="EDITAR" onPress={() => abrir(mensaje)} />
                  <EnlaceAdmin etiqueta="ELIMINAR" peligro onPress={() => onEliminar(mensaje)} />
                </AccionesAdmin>
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
          key={editando ? idDe(editando) : 'nuevo'}
          valores={valoresDe(editando ?? undefined)}
          onCancelar={() => setAbierto(false)}
          onGuardar={guardar}
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
