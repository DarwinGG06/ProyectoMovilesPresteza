import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Plato } from '@/features/inicio/components/MesaDecor';
import { PRODUCTOS_DESTACADOS } from '@/features/inicio/data';
import { formatCOP, useCart } from '@/services/cart/CartContext';

import { useCuenta } from '../../hooks/useCuenta';
import type { PlatoFavorito, UsuarioPerfil } from '../../types';
import { formatFecha } from '../../utils';
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
  const { addItem } = useCart();
  const cuenta = useCuenta({ userId, perfil, onActualizado });
  const [principal, segundo, postre] = PRODUCTOS_DESTACADOS;
  const platosFavoritos = favoritos.filter((plato) => plato.name);

  return (
    <View>
      <TarjetaPerfil
        numero="I"
        badge="DATOS"
        titulo="Tu información"
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
              { etiqueta: 'NOMBRE', valor: perfil.complete_name || 'Sin nombre' },
              { etiqueta: 'CORREO', valor: perfil.email || 'Sin correo' },
              { etiqueta: 'TELÉFONO', valor: perfil.phone_number || 'Sin teléfono' },
              { etiqueta: 'DESDE', valor: formatFecha(perfil.created_at) },
            ]}
          />
        )}
      </TarjetaPerfil>

      <TarjetaPerfil
        numero="II"
        badge="CARTA"
        titulo="Para tu mesa"
        accion={{ etiqueta: 'VER MENÚ', onPress: () => router.push('/menu') }}>
        <View className="mb-2 h-[220px]">
          <Pressable
            onPress={() =>
              addItem({ id: principal.id, productName: principal.name, unitPrice: principal.price })
            }
            className="absolute left-0 top-6">
            <Plato uri={principal.imageUrl} size={168} />
          </Pressable>
          <Pressable
            onPress={() =>
              addItem({ id: segundo.id, productName: segundo.name, unitPrice: segundo.price })
            }
            className="absolute right-2 top-0">
            <Plato uri={segundo.imageUrl} size={108} />
          </Pressable>
          {postre ? (
            <Pressable
              onPress={() =>
                addItem({ id: postre.id, productName: postre.name, unitPrice: postre.price })
              }
              className="absolute bottom-0 right-10">
              <Plato uri={postre.imageUrl} size={92} />
            </Pressable>
          ) : null}
        </View>

        {PRODUCTOS_DESTACADOS.map((plato, index) => (
          <Pressable
            key={plato.id}
            onPress={() =>
              addItem({ id: plato.id, productName: plato.name, unitPrice: plato.price })
            }
            className="flex-row items-baseline py-3.5">
            <Text className="w-7 font-roboto text-[10px] text-oro">
              {String(index + 1).padStart(2, '0')}
            </Text>
            <Text className="font-roboto-light text-lg text-crema">{plato.name}</Text>
            <View className="mx-2 mb-1 h-px flex-1 bg-oro/35" />
            <Text className="font-roboto text-oro">{formatCOP(plato.price)}</Text>
          </Pressable>
        ))}
      </TarjetaPerfil>

      <TarjetaPerfil numero="III" badge="FAVORITOS" titulo="Tus platos">
        {platosFavoritos.length === 0 ? (
          <EstadoVacio
            icono="heart-outline"
            titulo="Aún no tienes favoritos"
            texto="Explora el menú y marca lo que más te guste."
            accion={{ etiqueta: 'IR AL MENÚ', onPress: () => router.push('/menu') }}
          />
        ) : (
          <View>
            {platosFavoritos.map((plato, index) => (
              <View
                key={plato.id || plato._id}
                className="flex-row items-baseline border-b border-oro/20 py-3.5">
                <Text className="w-7 font-roboto text-[10px] text-oro">
                  {String(index + 1).padStart(2, '0')}
                </Text>
                <Text className="font-roboto-light text-lg text-crema">{plato.name}</Text>
                {plato.price ? (
                  <>
                    <View className="mx-2 mb-1 h-px flex-1 bg-oro/35" />
                    <Text className="font-roboto text-oro">{formatCOP(plato.price)}</Text>
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
