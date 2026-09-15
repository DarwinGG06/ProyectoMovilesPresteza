import { useCallback } from 'react';

import { actualizarProducto, crearProducto, eliminarProducto, listarProductos } from '@/api/productos';
import type { ProductoAdmin, ProductoForm } from '../types';
import { cambiosDe, idDe } from '../utils';
import { fusionar, useListaAdmin } from './adminComun';

export function useAdminProductos() {
  const { lista: productos, setLista, cargando, guardando, setGuardando, error, recargar, aviso, conToken } =
    useListaAdmin(listarProductos);

  const guardar = useCallback(
    async (datos: ProductoForm, editando?: ProductoAdmin | null) => {
      const sesion = conToken();
      if (!sesion) return false;
      const imagen = datos.imageUrl.trim();
      const actual = {
        name: datos.name.trim(),
        description: datos.description.trim(),
        price: Number(datos.price),
        categoryId: datos.categoryId,
        image: imagen,
      };

      setGuardando(true);
      try {
        if (editando) {
          const original = {
            name: editando.name,
            description: editando.description ?? '',
            price: editando.price,
            categoryId: editando.categoryId ?? '',
            image: editando.imageUrl ?? '',
          };
          const cambios = cambiosDe(actual, original);
          if (!Object.keys(cambios).length) {
            aviso.ok('Sin cambios', 'No hay nada que guardar.');
            return true;
          }
          const actualizado = await actualizarProducto(sesion, idDe(editando), cambios);
          setLista((prev) =>
            fusionar(prev, { ...editando, ...actualizado }, { ...cambios, imageUrl: imagen }),
          );
          aviso.ok('Plato editado', `${actual.name} fue editado.`);
        } else {
          const creado = await crearProducto(sesion, { ...actual, type: 'principal', available: true });
          setLista((prev) => [{ ...creado, ...actual, imageUrl: imagen, available: true }, ...prev]);
          aviso.ok('Plato creado', `${actual.name} ya está en la carta.`);
        }
        return true;
      } catch (err) {
        aviso.errorDe(err, 'No se pudo guardar.', 'Producto');
        return false;
      } finally {
        setGuardando(false);
      }
    },
    [aviso, conToken, setGuardando, setLista],
  );

  const alternar = useCallback(
    async (producto: ProductoAdmin) => {
      const sesion = conToken();
      if (!sesion) return;
      const available = producto.available === false;
      try {
        await actualizarProducto(sesion, idDe(producto), { available });
        setLista((prev) => fusionar(prev, producto, { available }));
        aviso.ok(
          available ? 'Plato activado' : 'Plato oculto',
          available ? `${producto.name} volvió a la carta.` : `${producto.name} quedó oculto.`,
        );
      } catch (err) {
        aviso.errorDe(err, 'No se pudo actualizar.', 'Producto');
      }
    },
    [aviso, conToken, setLista],
  );

  const eliminar = useCallback(
    (producto: ProductoAdmin) => {
      const sesion = conToken();
      if (!sesion) return;
      aviso.confirmar({
        sello: 'CARTA',
        titulo: 'Eliminar plato',
        texto: `¿Quitar ${producto.name} de la carta?`,
        confirmar: 'ELIMINAR',
        peligro: true,
        exito: { titulo: 'Plato eliminado', texto: `${producto.name} fue eliminado de la carta.` },
        onConfirmar: async () => {
          await eliminarProducto(sesion, idDe(producto));
          setLista((prev) => prev.filter((item) => idDe(item) !== idDe(producto)));
        },
      });
    },
    [aviso, conToken, setLista],
  );

  return { productos, cargando, guardando, error, recargar, guardar, alternar, eliminar };
}
