import { useState } from 'react';
import { Alert, Text, View } from 'react-native';

import { agregarTarjeta, eliminarTarjeta, marcarTarjetaPrincipal } from '../../api/perfilApi';
import type { TarjetaForm, UsuarioPerfil } from '../../types';
import { AccionesFila, Comanda, EnlaceAccion, LineaCuenta } from '../elementos';
import { FormularioPago } from '../formularios/FormularioPago';
import { EstadoVacio, Mensaje, TarjetaPerfil } from '../TarjetaPerfil';

type TabPagosProps = {
  userId: string;
  token: string;
  perfil: UsuarioPerfil;
  onActualizado: (perfil: UsuarioPerfil) => void;
};

export function TabPagos({ userId, token, perfil, onActualizado }: TabPagosProps) {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const guardar = async (datos: TarjetaForm) => {
    setError(null);
    setGuardando(true);
    try {
      const actualizado = await agregarTarjeta(userId, token, {
        name: datos.name.trim(),
        cardholder_name: datos.cardholder_name.trim(),
        last_four_digits: datos.last_four_digits,
        type: datos.type,
        brand: datos.brand,
        expiry_date: datos.expiry_date,
        is_primary: datos.is_primary,
      });
      onActualizado(actualizado);
      setMostrarForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la tarjeta.');
    } finally {
      setGuardando(false);
    }
  };

  const principal = async (index: number) => {
    try {
      onActualizado(await marcarTarjetaPrincipal(userId, token, index));
    } catch (err) {
      Alert.alert('Pago', err instanceof Error ? err.message : 'No se pudo marcar como principal.');
    }
  };

  const borrar = (index: number, nombre: string) => {
    Alert.alert('Eliminar tarjeta', `¿Quieres eliminar ${nombre}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            onActualizado(await eliminarTarjeta(userId, token, index));
          } catch (err) {
            Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo eliminar.');
          }
        },
      },
    ]);
  };

  return (
    <TarjetaPerfil
      numero="I"
      badge="PAGOS"
      titulo="Métodos guardados"
      accion={mostrarForm ? undefined : { etiqueta: 'AGREGAR', onPress: () => setMostrarForm(true) }}>
      {error ? <Mensaje texto={error} error /> : null}

      {mostrarForm ? (
        <Comanda>
          <FormularioPago onCancelar={() => setMostrarForm(false)} onGuardar={guardar} guardando={guardando} />
        </Comanda>
      ) : perfil.paymentCards.length === 0 ? (
        <EstadoVacio
          icono="card-outline"
          titulo="Sin métodos de pago"
          texto="Guarda solo los últimos 4 dígitos. No pedimos el número completo."
          accion={{ etiqueta: 'AGREGAR TARJETA', onPress: () => setMostrarForm(true) }}
        />
      ) : (
        <View>
          {perfil.paymentCards.map((tarjeta, index) => (
            <LineaCuenta
              key={`${tarjeta.last_four_digits}-${index}`}
              indice={index}
              titulo={`${tarjeta.brand} · ${tarjeta.last_four_digits}`}
              sello={tarjeta.is_primary ? 'PRINCIPAL' : undefined}>
              <Text className="mt-1 text-sm text-crema/70">{tarjeta.name}</Text>
              <Text className="mt-1 text-sm text-crema/45">
                {tarjeta.cardholder_name} · {tarjeta.type === 'debit' ? 'Débito' : 'Crédito'} · {tarjeta.expiry_date}
              </Text>
              <AccionesFila>
                {!tarjeta.is_primary ? (
                  <EnlaceAccion etiqueta="PRINCIPAL" onPress={() => principal(index)} />
                ) : null}
                <EnlaceAccion etiqueta="ELIMINAR" onPress={() => borrar(index, tarjeta.name)} peligro />
              </AccionesFila>
            </LineaCuenta>
          ))}
        </View>
      )}
    </TarjetaPerfil>
  );
}
