import { useCallback } from 'react';

import { actualizarProducto, crearProducto, eliminarProducto, listarProductos } from '../api/adminApi';
import type { ProductoAdmin, ProductoForm } from '../types';
import { idDe } from '../utils';
import { fusionar, useListaAdmin } from './adminComun';

export function useAdminProductos() {
  const { lista: productos, setLista, cargando, guardando, setGuardando, error, recargar, aviso, conToken } =
    useListaAdmin(listarProductos);

  const guardar = useCallback(
    async (datos: ProductoForm, editando?: ProductoAdmin | null) => {
      const sesion = conToken();
      if (!sesion) return false;
      const cuerpo = {
        name: datos.name.trim(),
        description: datos.description.trim(),
        price: Number(datos.price),
        categoryId: datos.categoryId,
         image: datos.imageUrl.trim(),
         type: "acompañante",
        available: editando?.available !== false,
      };

      setGuardando(true);
      try {
        if (editando) {
          const actualizado = await actualizarProducto(sesion, idDe(editando), cuerpo);
          setLista((prev) => fusionar(prev, { ...editando, ...actualizado }, cuerpo));
          aviso.ok('Plato editado', `${cuerpo.name} fue editado.`);
        } else {
          const creado = await crearProducto(sesion, cuerpo);
          setLista((prev) => [{ ...creado, ...cuerpo }, ...prev]);
          aviso.ok('Plato creado', `${cuerpo.name} ya está en la carta.`);
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
