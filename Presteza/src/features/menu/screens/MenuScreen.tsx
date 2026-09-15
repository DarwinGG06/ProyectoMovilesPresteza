import { useEffect, useMemo, useState } from 'react';
import { Image, Text, View } from 'react-native';

import { listarProductos } from '@/api/productos';
import Badge from '@/components/Badge';
import CampoBusqueda from '@/components/CampoBusqueda';
import MensajeError from '@/components/MensajeError';
import Tarjeta from '@/components/Tarjeta';
import { formatCOP } from '@/services/cart/CartContext';
import { ContenedorPantalla } from '@/shared/components/contenedor-pantalla/ContenedorPantalla';
import type { Producto } from '@/types';

export function MenuScreen() {
  const [platos, setPlatos] = useState<Producto[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let viva = true;
    listarProductos()
      .then((lista) => {
        if (viva) setPlatos(lista.filter((plato) => plato.available !== false));
      })
      .catch((err) => {
        if (viva) setError(err instanceof Error ? err.message : 'No se pudo cargar el menú.');
      });
    return () => {
      viva = false;
    };
  }, []);

  const lista = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return platos;
    return platos.filter(
      (plato) =>
        plato.name.toLowerCase().includes(texto) || (plato.description ?? '').toLowerCase().includes(texto),
    );
  }, [busqueda, platos]);

  return (
    <ContenedorPantalla titulo="Menú">
      <Badge text="CARTA" className="mt-4" />
      <Text className="mt-3 text-base text-texto/70">
        Platos que salen del backend. Puedes buscar por nombre o descripción.
      </Text>

      <CampoBusqueda value={busqueda} onChangeText={setBusqueda} placeholder="Buscar un plato..." className="mt-6" />

      <MensajeError className="mt-4" texto={error ?? undefined} />

      <View className="mt-6 gap-4">
        {lista.length === 0 ? (
          <Tarjeta className="p-4">
            <Text className="text-sm text-texto/70">No hay platos para mostrar. Entra como admin y crea el primero.</Text>
          </Tarjeta>
        ) : (
          lista.map((plato) => (
            <Tarjeta key={plato._id || plato.id || plato.name} className="overflow-hidden p-0">
              {plato.imageUrl ? <Image source={{ uri: plato.imageUrl }} className="h-40 w-full bg-linea" /> : null}
              <View className="gap-1 p-4">
                <Text className="text-lg font-semibold text-marca-oscura">{plato.name}</Text>
                {plato.description ? <Text className="text-sm text-texto/70">{plato.description}</Text> : null}
                <Text className="mt-2 text-base text-marca">{formatCOP(plato.price)}</Text>
              </View>
            </Tarjeta>
          ))
        )}
      </View>
    </ContenedorPantalla>
  );
}
