import { View } from 'react-native';

import type { Usuario } from '@/types';
import { BotonPerfil, Comanda } from '@/features/perfil/components/elementos';
import { TarjetaPerfil } from '@/features/perfil/components/TarjetaPerfil';

import type { AjustesForm } from '../../types';
import { FormularioAjustes } from '../formularios/FormularioAjustes';

type TabAjustesProps = {
  user: Usuario;
  guardando?: boolean;
  onGuardar: (datos: AjustesForm) => Promise<boolean>;
  onSalir: () => void;
};

export function TabAjustes({ user, guardando, onGuardar, onSalir }: TabAjustesProps) {
  return (
    <View>
      <TarjetaPerfil numero="I" badge="CUENTA" titulo="Tu usuario">
        <Comanda>
          <FormularioAjustes
            key={`${user.id}-${user.email}-${user.phone}`}
            valores={{ name: user.name, email: user.email, phone: user.phone }}
            onGuardar={async (datos) => {
              await onGuardar(datos);
            }}
            guardando={guardando}
          />
        </Comanda>
      </TarjetaPerfil>

      <TarjetaPerfil numero="II" badge="SESIÓN" titulo="Salir">
        <BotonPerfil etiqueta="CERRAR SESIÓN" onPress={onSalir} variante="peligro" />
      </TarjetaPerfil>
    </View>
  );
}
