import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';

import { actualizarPerfilApi } from '../../api/perfilApi';
import type { ContrasenaForm, PerfilForm, UsuarioPerfil } from '../../types';
import { CuentaEscrita } from '../CuentaEscrita';
import { BotonPerfil, Comanda } from '../elementos';
import { FormularioContrasena } from '../formularios/FormularioContrasena';
import { FormularioDatos } from '../formularios/FormularioDatos';
import { Mensaje, TarjetaPerfil } from '../TarjetaPerfil';

type TabAjustesProps = {
  userId: string;
  perfil: UsuarioPerfil;
  onActualizado: (perfil: UsuarioPerfil) => void;
  onCerrarSesion: () => void;
};

export function TabAjustes({ userId, perfil, onActualizado, onCerrarSesion }: TabAjustesProps) {
  const [editando, setEditando] = useState(false);
  const [cambiandoClave, setCambiandoClave] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const guardarDatos = async (datos: PerfilForm) => {
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      onActualizado(await actualizarPerfilApi(userId, datos));
      setEditando(false);
      setMensaje('Información actualizada.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar.');
    } finally {
      setGuardando(false);
    }
  };

  const guardarClave = async (datos: ContrasenaForm) => {
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      await actualizarPerfilApi(userId, { password: datos.newPassword });
      setCambiandoClave(false);
      setMensaje('Contraseña actualizada.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cambiar la contraseña.');
    } finally {
      setGuardando(false);
    }
  };

  const cerrar = () => {
    Alert.alert('Cerrar sesión', '¿Quieres salir de tu cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        onPress: () => {
          onCerrarSesion();
          router.push('/');
        },
      },
    ]);
  };

  return (
    <View>
      <TarjetaPerfil
        numero="I"
        badge="CUENTA"
        titulo="Información personal"
        accion={editando ? undefined : { etiqueta: 'EDITAR', onPress: () => setEditando(true) }}>
        {mensaje ? <Mensaje texto={mensaje} /> : null}
        {error ? <Mensaje texto={error} error /> : null}
        {editando ? (
          <Comanda>
            <FormularioDatos
              valores={{
                complete_name: perfil.complete_name,
                email: perfil.email,
                phone_number: perfil.phone_number,
              }}
              onCancelar={() => setEditando(false)}
              onGuardar={guardarDatos}
              guardando={guardando}
            />
          </Comanda>
        ) : (
          <CuentaEscrita
            animar={false}
            filas={[
              { etiqueta: 'NOMBRE', valor: perfil.complete_name },
              { etiqueta: 'CORREO', valor: perfil.email },
              { etiqueta: 'TELÉFONO', valor: perfil.phone_number || 'Sin teléfono' },
            ]}
          />
        )}
      </TarjetaPerfil>

      <TarjetaPerfil numero="II" badge="SEGURIDAD" titulo="Contraseña">
        {cambiandoClave ? (
          <Comanda>
            <FormularioContrasena
              onCancelar={() => setCambiandoClave(false)}
              onGuardar={guardarClave}
              guardando={guardando}
            />
          </Comanda>
        ) : (
          <BotonPerfil etiqueta="CAMBIAR CONTRASEÑA" onPress={() => setCambiandoClave(true)} variante="outline" />
        )}
      </TarjetaPerfil>

      <TarjetaPerfil numero="III" badge="SESIÓN" titulo="Salir">
        <BotonPerfil etiqueta="CERRAR SESIÓN" onPress={cerrar} variante="peligro" />
      </TarjetaPerfil>
    </View>
  );
}
