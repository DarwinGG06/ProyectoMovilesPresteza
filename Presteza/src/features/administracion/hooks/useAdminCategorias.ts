import { useCallback } from 'react';

import { actualizarCategoria, crearCategoria, eliminarCategoria, listarCategorias } from '../api/adminApi';
import type { CategoriaAdmin, CategoriaForm } from '../types';
import { idDe } from '../utils';
import { fusionar, useListaAdmin } from './adminComun';

export function useAdminCategorias() {
  const { lista: categorias, setLista, cargando, guardando, setGuardando, error, recargar, aviso, conToken } =
    useListaAdmin(listarCategorias);

  const guardar = useCallback(
    async (datos: CategoriaForm, editando?: CategoriaAdmin | null) => {
      const sesion = conToken();
      if (!sesion) return false;
      const cuerpo = {
        name: datos.name.trim(),
        description: datos.description.trim(),
        imageUrl: datos.imageUrl.trim(),
      };

      setGuardando(true);
      try {
        if (editando) {
          const actualizado = await actualizarCategoria(sesion, idDe(editando), cuerpo);
          setLista((prev) => fusionar(prev, { ...editando, ...actualizado }, cuerpo));
          aviso.ok('Categoría editada', `${cuerpo.name} fue editada.`);
        } else {
          const creada = await crearCategoria(sesion, cuerpo);
          setLista((prev) => [{ ...creada, ...cuerpo }, ...prev]);
          aviso.ok('Categoría creada', `${cuerpo.name} ya está en la carta.`);
        }
        return true;
      } catch (err) {
        aviso.errorDe(err, 'No se pudo guardar.', 'Categoría');
        return false;
      } finally {
        setGuardando(false);
      }
    },
    [aviso, conToken, setGuardando, setLista],
  );

  const eliminar = useCallback(
    (categoria: CategoriaAdmin) => {
      const sesion = conToken();
      if (!sesion) return;
      aviso.confirmar({
        sello: 'CARTA',
        titulo: 'Eliminar categoría',
        texto: `¿Quitar ${categoria.name} de la carta?`,
        confirmar: 'ELIMINAR',
        peligro: true,
        exito: { titulo: 'Categoría eliminada', texto: `${categoria.name} fue eliminada.` },
        onConfirmar: async () => {
          await eliminarCategoria(sesion, idDe(categoria));
          setLista((prev) => prev.filter((item) => idDe(item) !== idDe(categoria)));
        },
      });
    },
    [aviso, conToken, setLista],
  );

  return { categorias, cargando, guardando, error, recargar, guardar, eliminar };
}
