import { useState } from 'react';
import { Alert, Text, View } from 'react-native';

import {
  actualizarDireccion,
  agregarDireccion,
  eliminarDireccion,
  marcarDireccionPrincipal,
} from '../../api/perfilApi';
import type { Direccion, DireccionForm, UsuarioPerfil } from '../../types';
import { AccionesFila, Comanda, EnlaceAccion, LineaCuenta } from '../elementos';
import { FormularioDireccion } from '../formularios/FormularioDireccion';
import { EstadoVacio, Mensaje, TarjetaPerfil } from '../TarjetaPerfil';

type TabDireccionesProps = {
  userId: string;
  perfil: UsuarioPerfil;
  onActualizado: (perfil: UsuarioPerfil) => void;
};

export function TabDirecciones({ userId, perfil, onActualizado }: TabDireccionesProps) {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [indiceEdicion, setIndiceEdicion] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cerrar = () => {
    setMostrarForm(false);
    setIndiceEdicion(null);
    setError(null);
  };

  const guardar = async (datos: DireccionForm) => {
    setError(null);
    setGuardando(true);
    const cuerpo: Direccion = {
      name: datos.name.trim(),
      address: datos.address.trim(),
      neighborhood: datos.neighborhood.trim(),
      city: 'Manizales',
      postal_code: '170001',
      is_primary: datos.is_primary,
    };

    try {
      const actualizado =
        indiceEdicion === null
          ? await agregarDireccion(userId, cuerpo)
          : await actualizarDireccion(userId, indiceEdicion, cuerpo);
      onActualizado(actualizado);
      cerrar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la dirección.');
    } finally {
      setGuardando(false);
    }
  };

  const principal = async (index: number) => {
    try {
      onActualizado(await marcarDireccionPrincipal(userId, index));
    } catch (err) {
      Alert.alert('Dirección', err instanceof Error ? err.message : 'No se pudo marcar como principal.');
    }
  };

  const borrar = (index: number, nombre: string) => {
    Alert.alert('Eliminar dirección', `¿Quieres eliminar ${nombre}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            onActualizado(await eliminarDireccion(userId, index));
          } catch (err) {
            Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo eliminar.');
          }
        },
      },
    ]);
  };

  const valoresEdicion =
    indiceEdicion === null
      ? undefined
      : {
          name: perfil.addresses[indiceEdicion]?.name ?? '',
          address: perfil.addresses[indiceEdicion]?.address ?? '',
          neighborhood: perfil.addresses[indiceEdicion]?.neighborhood ?? '',
          is_primary: Boolean(perfil.addresses[indiceEdicion]?.is_primary),
        };

  return (
    <TarjetaPerfil
      numero="I"
      badge="DIRECCIONES"
      titulo="Tus destinos"
      accion={
        mostrarForm || indiceEdicion !== null
          ? undefined
          : { etiqueta: 'AGREGAR', onPress: () => setMostrarForm(true) }
      }>
      {error ? <Mensaje texto={error} error /> : null}

      {mostrarForm || indiceEdicion !== null ? (
        <Comanda>
          <FormularioDireccion
            valores={valoresEdicion}
            onCancelar={cerrar}
            onGuardar={guardar}
            guardando={guardando}
          />
        </Comanda>
      ) : perfil.addresses.length === 0 ? (
        <EstadoVacio
          icono="location-outline"
          titulo="Sin direcciones"
          texto="Guarda una para agilizar tus pedidos en Manizales."
          accion={{ etiqueta: 'AGREGAR DIRECCIÓN', onPress: () => setMostrarForm(true) }}
        />
      ) : (
        <View>
          {perfil.addresses.map((direccion, index) => (
            <LineaCuenta
              key={`${direccion.name}-${index}`}
              indice={index}
              titulo={direccion.name}
              sello={direccion.is_primary ? 'PRINCIPAL' : undefined}>
              <Text className="mt-1 text-sm text-crema/70">{direccion.address}</Text>
              <Text className="mt-1 text-sm text-crema/45">
                {direccion.neighborhood} · {direccion.city}
              </Text>
              <AccionesFila>
                {!direccion.is_primary ? (
                  <EnlaceAccion etiqueta="PRINCIPAL" onPress={() => principal(index)} />
                ) : null}
                <EnlaceAccion
                  etiqueta="EDITAR"
                  onPress={() => {
                    setIndiceEdicion(index);
                    setMostrarForm(false);
                  }}
                />
                <EnlaceAccion etiqueta="ELIMINAR" onPress={() => borrar(index, direccion.name)} peligro />
              </AccionesFila>
            </LineaCuenta>
          ))}
        </View>
      )}
    </TarjetaPerfil>
  );
}
