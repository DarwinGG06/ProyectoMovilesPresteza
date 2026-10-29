import { useEffect } from 'react';
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
  abrirTick?: number;
};

export function TabPagos({ userId, token, perfil, onActualizado, abrirTick = 0 }: TabPagosProps) {
  const pagos = usePagos({ userId, token, tarjetas: perfil.paymentCards, onActualizado });

  useEffect(() => {
    if (abrirTick > 0) pagos.abrirFormulario();
  }, [abrirTick, pagos.abrirFormulario]);

  return (
    <TarjetaPerfil numero="I" badge="PAGOS" titulo="Métodos guardados" compacto>
      {pagos.error ? <Mensaje texto={pagos.error} error /> : null}

      {pagos.formularioAbierto ? (
        <Comanda>
          <FormularioPago
            // Cambia la key para que el formulario se arme de nuevo con los
            // valores de otra tarjeta (o vacío para una nueva).
            key={pagos.indiceEdicion === null ? 'nueva' : `editar-${pagos.indiceEdicion}`}
            valores={pagos.valores}
            onCancelar={pagos.cancelar}
            onGuardar={pagos.guardar}
            guardando={pagos.guardando}
          />
        </Comanda>
      ) : perfil.paymentCards.length === 0 ? (
        <EstadoVacio
          icono="card-outline"
          titulo="Sin métodos de pago"
          texto="Guarda solo los últimos 4 dígitos. No pedimos el número completo."
        />
      ) : (
        <View>
          {perfil.paymentCards.map((tarjeta, index) => (
            <LineaCuenta
              key={`${tarjeta.last_four_digits}-${index}`}
              indice={index}
              titulo={`${tarjeta.brand} · ${tarjeta.last_four_digits}`}
              sello={tarjeta.is_primary ? 'PRINCIPAL' : undefined}>
              <Text className="mt-1 font-roboto text-sm text-tinta/70">{tarjeta.name}</Text>
              <Text className="mt-1 font-roboto text-sm text-tinta/70">
                {tarjeta.cardholder_name} · {tarjeta.type === 'debit' ? 'Débito' : 'Crédito'} ·{' '}
                {tarjeta.expiry_date}
              </Text>
              <AccionesFila>
                {!tarjeta.is_primary ? (
                  <EnlaceAccion etiqueta="PRINCIPAL" onPress={() => pagos.marcarPrincipal(index)} />
                ) : null}
                <EnlaceAccion etiqueta="EDITAR" onPress={() => pagos.editar(index)} />
                <EnlaceAccion
                  etiqueta="ELIMINAR"
                  onPress={() => pagos.eliminar(index, tarjeta.name)}
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
