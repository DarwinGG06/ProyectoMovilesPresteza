import { View } from 'react-native';
import { BiometricSettings } from '@/session/BiometricSettings';
import { formatearFechaLarga } from '@/shared/fechaNacimiento';
import { useAjustes } from '../../hooks/useAjustes';
import type { UsuarioPerfil } from '../../types';
import { CuentaEscrita } from '../CuentaEscrita';
import { BotonPerfil, Comanda, TarjetaFolio } from '../elementos';
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
  const ajustes = useAjustes({ userId, perfil, onActualizado, onCerrarSesion });

  return (
    <View>
      <TarjetaPerfil
        numero="I"
        badge="CUENTA"
        titulo="Información personal"
        accion={ajustes.editando ? undefined : { etiqueta: 'EDITAR', onPress: ajustes.editar }}>
        {ajustes.mensaje ? <Mensaje texto={ajustes.mensaje} /> : null}
        {ajustes.error ? <Mensaje texto={ajustes.error} error /> : null}
        {ajustes.editando ? (
          <Comanda>
            <FormularioDatos
              valores={ajustes.valores}
              onCancelar={ajustes.cancelar}
              onGuardar={ajustes.guardarDatos}
              guardando={ajustes.guardando}
            />
          </Comanda>
        ) : (
          <TarjetaFolio>
            <CuentaEscrita
              animar={false}
              filas={[
                { etiqueta: 'NOMBRE', valor: perfil.complete_name },
                { etiqueta: 'CORREO', valor: perfil.email },
                { etiqueta: 'TELÉFONO', valor: perfil.phone_number || 'Sin teléfono' },
                {
                  etiqueta: 'CUMPLE',
                  valor: perfil.birthDate
                    ? formatearFechaLarga(perfil.birthDate) || perfil.birthDate
                    : 'Sin fecha',
                },
              ]}
            />
          </TarjetaFolio>
        )}
      </TarjetaPerfil>

      <TarjetaPerfil numero="II" badge="SEGURIDAD" titulo="Contraseña">
        {ajustes.cambiandoClave ? (
          <Comanda>
            <FormularioContrasena
              onCancelar={ajustes.cancelarClave}
              onGuardar={ajustes.guardarClave}
              guardando={ajustes.guardando}
            />
          </Comanda>
        ) : (
          <TarjetaFolio>
            <BotonPerfil
              etiqueta="CAMBIAR CONTRASEÑA"
              onPress={ajustes.empezarClave}
              variante="outline"
            />
          </TarjetaFolio>
        )}
        <BiometricSettings />
      </TarjetaPerfil>

      <TarjetaPerfil numero="III" badge="SESIÓN" titulo="Salir">
        <TarjetaFolio>
          <BotonPerfil etiqueta="CERRAR SESIÓN" onPress={ajustes.cerrarSesion} variante="peligro" />
        </TarjetaFolio>
      </TarjetaPerfil>
    </View>
  );
}
