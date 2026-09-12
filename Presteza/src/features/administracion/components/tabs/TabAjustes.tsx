import { useState } from 'react';
import { View } from 'react-native';

import type { Usuario } from '@/auth/AuthContext';
import { actualizarPerfilApi } from '@/features/perfil/api/perfilApi';
import { BotonPerfil, Comanda } from '@/features/perfil/components/elementos';
import { Mensaje, TarjetaPerfil } from '@/features/perfil/components/TarjetaPerfil';
import { useAviso } from '@/shared/components/aviso';

import type { AjustesForm } from '../../types';
import { FormularioAjustes } from '../formularios/FormularioAjustes';

type TabAjustesProps = {
  user: Usuario;
  onActualizar: (parcial: Partial<Usuario>) => void;
  onCerrarSesion: () => void;
};

export function TabAjustes({ user, onActualizar, onCerrarSesion }: TabAjustesProps) {
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const aviso = useAviso();

  const guardar = async (datos: AjustesForm) => {
    setGuardando(true);
    setMensaje(null);
    try {
      const actualizado = await actualizarPerfilApi(user.id, {
        complete_name: datos.name.trim(),
        email: datos.email.trim(),
        phone_number: datos.phone.trim(),
      });
      onActualizar({
        name: actualizado.complete_name || datos.name.trim(),
        email: actualizado.email || datos.email.trim(),
        phone: actualizado.phone_number || datos.phone.trim(),
      });
      setMensaje('Cuenta actualizada en el servidor.');
      aviso.ok('Cuenta editada', 'Tu usuario fue editado.');
    } catch (err) {
      aviso.errorDe(err, 'No se pudo guardar.', 'Ajustes');
    } finally {
      setGuardando(false);
    }
  };

  const salir = () => {
    aviso.confirmar({
      sello: 'SESIÓN',
      titulo: 'Cerrar sesión',
      texto: '¿Quieres salir de la casa?',
      confirmar: 'SALIR',
      peligro: true,
      onConfirmar: onCerrarSesion,
    });
  };

  return (
    <View>
      <TarjetaPerfil numero="I" badge="CUENTA" titulo="Tu usuario">
        {mensaje ? <Mensaje texto={mensaje} /> : null}
        <Comanda>
          <FormularioAjustes
            key={`${user.id}-${user.email}-${user.phone}`}
            valores={{ name: user.name, email: user.email, phone: user.phone }}
            onGuardar={guardar}
            guardando={guardando}
          />
        </Comanda>
      </TarjetaPerfil>

      <TarjetaPerfil numero="II" badge="SESIÓN" titulo="Salir">
        <BotonPerfil etiqueta="CERRAR SESIÓN" onPress={salir} variante="peligro" />
      </TarjetaPerfil>
    </View>
  );
}
