import { Text, View } from 'react-native';

import { usePagos } from '../../hooks/usePagos';
import type { UsuarioPerfil } from '../../types';
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
  const pagos = usePagos({ userId, token, onActualizado });

  return (
    <TarjetaPerfil
      numero="I"
      badge="PAGOS"
      titulo="Métodos guardados"
      accion={
        pagos.formularioAbierto ? undefined : { etiqueta: 'AGREGAR', onPress: pagos.abrirFormulario }
      }>
      {pagos.error ? <Mensaje texto={pagos.error} error /> : null}

      {pagos.formularioAbierto ? (
        <Comanda>
          <FormularioPago onCancelar={pagos.cancelar} onGuardar={pagos.guardar} guardando={pagos.guardando} />
        </Comanda>
      ) : perfil.paymentCards.length === 0 ? (
        <EstadoVacio
          icono="card-outline"
          titulo="Sin métodos de pago"
          texto="Guarda solo los últimos 4 dígitos. No pedimos el número completo."
          accion={{ etiqueta: 'AGREGAR TARJETA', onPress: pagos.abrirFormulario }}
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
                  <EnlaceAccion etiqueta="PRINCIPAL" onPress={() => pagos.marcarPrincipal(index)} />
                ) : null}
                <EnlaceAccion etiqueta="ELIMINAR" onPress={() => pagos.eliminar(index, tarjeta.name)} peligro />
              </AccionesFila>
            </LineaCuenta>
          ))}
        </View>
      )}
    </TarjetaPerfil>
  );
}
