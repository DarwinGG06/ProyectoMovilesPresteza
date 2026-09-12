import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { TarjetaPerfil } from '@/features/perfil/components/TarjetaPerfil';
import { useAviso } from '@/shared/components/aviso';

import { actualizarMensaje, crearMensaje, eliminarMensaje } from '../../api/adminApi';
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
  token: string;
  mensajes: MensajeAdmin[];
  setMensajes: (mensajes: MensajeAdmin[]) => void;
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

function cuerpoDe(datos: MensajeForm) {
  return {
    user_name: datos.name.trim(),
    user_email: datos.email.trim().toLowerCase(),
    user_phone: datos.phone.trim(),
    user_title: datos.subject.trim(),
    user_comment: datos.message.trim(),
  };
}

export function TabMensajes({ token, mensajes, setMensajes }: TabMensajesProps) {
  const [vista, setVista] = useState<'lista' | 'cuadricula'>('lista');
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState<MensajeAdmin | null>(null);
  const [detalle, setDetalle] = useState<MensajeAdmin | null>(null);
  const [guardando, setGuardando] = useState(false);
  const aviso = useAviso();

  const lista = useMemo(
    () =>
      [...mensajes].sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()),
    [mensajes],
  );

  const abrir = (mensaje?: MensajeAdmin) => {
    setEditando(mensaje ?? null);
    setAbierto(true);
  };

  const guardar = async (datos: MensajeForm) => {
    setGuardando(true);
    try {
      const cuerpo = cuerpoDe(datos);
      const visto = {
        name: cuerpo.user_name,
        email: cuerpo.user_email,
        phone: cuerpo.user_phone,
        subject: cuerpo.user_title,
        message: cuerpo.user_comment,
      };
      if (editando) {
        const actualizado = await actualizarMensaje(token, idDe(editando), cuerpo);
        setMensajes(mensajes.map((item) => (idDe(item) === idDe(editando) ? { ...item, ...actualizado, ...visto } : item)));
        aviso.ok('Mensaje editado', `El mensaje de ${visto.name} fue editado.`);
      } else {
        const creado = await crearMensaje(token, cuerpo);
        setMensajes([{ ...creado, ...visto }, ...mensajes]);
        aviso.ok('Mensaje creado', `El mensaje de ${visto.name} fue creado.`);
      }
      setAbierto(false);
    } catch (err) {
      aviso.errorDe(err, 'No se pudo guardar.', 'Mensaje');
    } finally {
      setGuardando(false);
    }
  };

  const borrar = (mensaje: MensajeAdmin) => {
    aviso.confirmar({
      sello: 'CORREO',
      titulo: 'Eliminar mensaje',
      texto: `¿Borrar el mensaje de ${mensaje.name}?`,
      confirmar: 'ELIMINAR',
      peligro: true,
      exito: {
        titulo: 'Mensaje eliminado',
        texto: `El mensaje de ${mensaje.name} fue eliminado.`,
      },
      onConfirmar: async () => {
        await eliminarMensaje(token, idDe(mensaje));
        setMensajes(mensajes.filter((item) => idDe(item) !== idDe(mensaje)));
        if (detalle && idDe(detalle) === idDe(mensaje)) setDetalle(null);
      },
    });
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
          <EstadoVacioAdmin icono="mail-outline" titulo="Sin mensajes" texto="Crea uno o espera a que escriban." />
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
                  <Text className="text-sm font-light text-white" numberOfLines={2}>
                    {mensaje.subject}
                  </Text>
                  <AccionesAdmin>
                    <EnlaceAdmin etiqueta="VER" onPress={() => setDetalle(mensaje)} />
                    <EnlaceAdmin etiqueta="EDITAR" onPress={() => abrir(mensaje)} />
                    <EnlaceAdmin etiqueta="ELIMINAR" peligro onPress={() => borrar(mensaje)} />
                  </AccionesAdmin>
                </CeldaTabla>
                <CeldaTabla flex={0.8}>
                  <Text className="text-sm text-crema/70" numberOfLines={1}>
                    {mensaje.name}
                  </Text>
                  <Text className="mt-0.5 text-[11px] text-crema/40" numberOfLines={1}>
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
                <Text className="text-base font-light text-white" numberOfLines={2}>
                  {mensaje.subject}
                </Text>
                <Text className="mt-1 text-sm text-crema/70" numberOfLines={1}>
                  {mensaje.name}
                </Text>
                <Text className="mt-2 text-sm text-crema/50" numberOfLines={3}>
                  {mensaje.message}
                </Text>
                <AccionesAdmin>
                  <EnlaceAdmin etiqueta="VER" onPress={() => setDetalle(mensaje)} />
                  <EnlaceAdmin etiqueta="EDITAR" onPress={() => abrir(mensaje)} />
                  <EnlaceAdmin etiqueta="ELIMINAR" peligro onPress={() => borrar(mensaje)} />
                </AccionesAdmin>
              </CajaCuadricula>
            ))}
          </GrillaAdmin>
        )}
      </TarjetaPerfil>

      <ModalAdmin visible={abierto} titulo={editando ? 'Editar mensaje' : 'Nuevo mensaje'} onCerrar={() => setAbierto(false)}>
        <FormularioMensaje
          key={editando ? idDe(editando) : 'nuevo'}
          valores={valoresDe(editando ?? undefined)}
          onCancelar={() => setAbierto(false)}
          onGuardar={guardar}
          guardando={guardando}
        />
      </ModalAdmin>

      <ModalAdmin visible={Boolean(detalle)} titulo={detalle?.subject || 'Mensaje'} onCerrar={() => setDetalle(null)}>
        {detalle ? (
          <View className="gap-3">
            <Text className="text-base text-marca-oscura">{detalle.name}</Text>
            <Text className="text-sm text-texto/70">{detalle.email}</Text>
            {detalle.phone ? <Text className="text-sm text-texto/70">{detalle.phone}</Text> : null}
            <Text className="text-sm text-texto/55">{formatoFechaHora(detalle.createdAt)}</Text>
            <Text className="mt-2 text-base leading-6 text-marca-oscura">{detalle.message}</Text>
            <AccionesAdmin>
              <EnlaceAdmin etiqueta="EDITAR" onPress={() => { setDetalle(null); abrir(detalle); }} />
              <EnlaceAdmin etiqueta="ELIMINAR" peligro onPress={() => borrar(detalle)} />
            </AccionesAdmin>
          </View>
        ) : null}
      </ModalAdmin>
    </View>
  );
}
