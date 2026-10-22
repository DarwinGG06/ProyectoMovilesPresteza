import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { formatCOP } from '@/services/cart/CartContext';
import { formatearFechaLarga } from '@/shared/fechaNacimiento';

import { useCuenta } from '../../hooks/useCuenta';
import type { PlatoFavorito, UsuarioPerfil } from '../../types';
import { CuentaEscrita } from '../CuentaEscrita';
import { Comanda } from '../elementos';
import { FormularioDatos } from '../formularios/FormularioDatos';
import { EstadoVacio, Mensaje, TarjetaPerfil } from '../TarjetaPerfil';

type TabCuentaProps = {
  userId: string;
  perfil: UsuarioPerfil;
  favoritos: PlatoFavorito[];
  onActualizado: (perfil: UsuarioPerfil) => void;
};

export function TabCuenta({ userId, perfil, favoritos, onActualizado }: TabCuentaProps) {
  const cuenta = useCuenta({ userId, perfil, onActualizado });
  const platosFavoritos = favoritos.filter((plato) => plato.name);

  return (
    <View>
      <TarjetaPerfil
        numero="I"
        badge="CONTACTO"
        titulo="Datos de mesa"
        accion={cuenta.editando ? undefined : { etiqueta: 'EDITAR', onPress: cuenta.editar }}>
        {cuenta.mensaje ? <Mensaje texto={cuenta.mensaje} /> : null}
        {cuenta.error ? <Mensaje texto={cuenta.error} error /> : null}

        {cuenta.editando ? (
          <Comanda>
            <FormularioDatos
              valores={cuenta.valores}
              onCancelar={cuenta.cancelar}
              onGuardar={cuenta.guardar}
              guardando={cuenta.guardando}
            />
          </Comanda>
        ) : (
          <CuentaEscrita
            filas={[
              { etiqueta: 'TELÉFONO', valor: perfil.phone_number || 'Sin teléfono' },
              {
                etiqueta: 'CUMPLE',
                valor: perfil.birthDate
                  ? formatearFechaLarga(perfil.birthDate) || perfil.birthDate
                  : 'Sin fecha',
              },
            ]}
          />
        )}
      </TarjetaPerfil>

      <TarjetaPerfil numero="II" badge="CARTA" titulo="Favoritos">
        {platosFavoritos.length === 0 ? (
          <EstadoVacio
            icono="heart-outline"
            texto="Todavía no has marcado ningún plato."
            accion={{ etiqueta: 'IR AL MENÚ', onPress: () => router.push('/home/menu') }}
          />
        ) : (
          <View>
            {platosFavoritos.map((plato, index) => (
              <View
                key={plato.id || plato._id}
                className="flex-row items-baseline border-b border-madera/15 py-3.5">
                <Text className="w-7 font-roboto text-[10px] text-marca">
                  {String(index + 1).padStart(2, '0')}
                </Text>
                <Text className="font-serif text-lg text-tinta">{plato.name}</Text>
                {plato.price ? (
                  <>
                    <View className="mx-2 mb-1 h-px flex-1 bg-madera/20" />
                    <Text className="font-roboto text-marca">{formatCOP(plato.price)}</Text>
                  </>
                ) : null}
              </View>
            ))}
          </View>
        )}
      </TarjetaPerfil>
    </View>
  );
}
