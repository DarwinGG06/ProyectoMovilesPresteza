import { Text, View } from 'react-native';

import { useDirecciones } from '../../hooks/useDirecciones';
import type { UsuarioPerfil } from '../../types';
import { AccionesFila, Comanda, EnlaceAccion, LineaCuenta } from '../elementos';
import { FormularioDireccion } from '../formularios/FormularioDireccion';
import { EstadoVacio, Mensaje, TarjetaPerfil } from '../TarjetaPerfil';

type TabDireccionesProps = {
  userId: string;
  perfil: UsuarioPerfil;
  onActualizado: (perfil: UsuarioPerfil) => void;
};

export function TabDirecciones({ userId, perfil, onActualizado }: TabDireccionesProps) {
  const direcciones = useDirecciones({ userId, perfil, onActualizado });

  return (
    <TarjetaPerfil
      numero="I"
      badge="DIRECCIONES"
      titulo="Tus destinos"
      accion={
        direcciones.mostrarAccion
          ? { etiqueta: 'AGREGAR', onPress: direcciones.abrirFormulario }
          : undefined
      }>
      {direcciones.error ? <Mensaje texto={direcciones.error} error /> : null}

      {direcciones.formularioAbierto ? (
        <Comanda>
          <FormularioDireccion
            valores={direcciones.valores}
            onCancelar={direcciones.cancelar}
            onGuardar={direcciones.guardar}
            guardando={direcciones.guardando}
          />
        </Comanda>
      ) : perfil.addresses.length === 0 ? (
        <EstadoVacio
          icono="location-outline"
          titulo="Sin direcciones"
          texto="Guarda una para agilizar tus pedidos en Manizales."
          accion={{ etiqueta: 'AGREGAR DIRECCIÓN', onPress: direcciones.abrirFormulario }}
        />
      ) : (
        <View>
          {perfil.addresses.map((direccion, index) => (
            <LineaCuenta
              key={`${direccion.name}-${index}`}
              indice={index}
              titulo={direccion.name}
              sello={direccion.is_primary ? 'PRINCIPAL' : undefined}>
              <Text className="mt-1 font-roboto text-sm text-crema/70">{direccion.address}</Text>
              <Text className="mt-1 font-roboto text-sm text-crema/45">
                {direccion.neighborhood} · {direccion.city}
              </Text>
              <AccionesFila>
                {!direccion.is_primary ? (
                  <EnlaceAccion
                    etiqueta="PRINCIPAL"
                    onPress={() => direcciones.marcarPrincipal(index)}
                  />
                ) : null}
                <EnlaceAccion etiqueta="EDITAR" onPress={() => direcciones.editar(index)} />
                <EnlaceAccion
                  etiqueta="ELIMINAR"
                  onPress={() => direcciones.eliminar(index, direccion.name)}
                  peligro
                />
              </AccionesFila>
            </LineaCuenta>
          ))}
        </View>
      )}
    </TarjetaPerfil>
  );
}
