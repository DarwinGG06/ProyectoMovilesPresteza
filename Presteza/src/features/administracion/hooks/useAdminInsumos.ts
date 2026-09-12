import { useCallback } from 'react';

import { actualizarInsumo, crearInsumo, eliminarInsumo, listarInsumos } from '../api/adminApi';
import type { InsumoAdmin, InsumoForm } from '../types';
import { idDe } from '../utils';
import { fusionar, useListaAdmin } from './adminComun';

export function useAdminInsumos() {
  const { lista: insumos, setLista, cargando, guardando, setGuardando, error, recargar, aviso, conToken } =
    useListaAdmin(listarInsumos);

  const guardar = useCallback(
    async (datos: InsumoForm, editando?: InsumoAdmin | null) => {
      const sesion = conToken();
      if (!sesion) return false;
      const cuerpo = {
        name: datos.name.trim(),
        description: datos.description.trim(),
        unit_price: Number(datos.unit_price),
        quantity: Number(datos.quantity),
      };

      setGuardando(true);
      try {
        if (editando) {
          const actualizado = await actualizarInsumo(sesion, idDe(editando), cuerpo);
          setLista((prev) => fusionar(prev, { ...editando, ...actualizado }, cuerpo));
          aviso.ok('Insumo editado', `${cuerpo.name} fue editado.`);
        } else {
          const creado = await crearInsumo(sesion, cuerpo);
          setLista((prev) => [{ ...creado, ...cuerpo }, ...prev]);
          aviso.ok('Insumo creado', `${cuerpo.name} ya está en la bodega.`);
        }
        return true;
      } catch (err) {
        aviso.errorDe(err, 'No se pudo guardar.', 'Inventario');
        return false;
      } finally {
        setGuardando(false);
      }
    },
    [aviso, conToken, setGuardando, setLista],
  );

  const eliminar = useCallback(
    (insumo: InsumoAdmin) => {
      const sesion = conToken();
      if (!sesion) return;
      aviso.confirmar({
        sello: 'BODEGA',
        titulo: 'Eliminar insumo',
        texto: `¿Quitar ${insumo.name} del inventario?`,
        confirmar: 'ELIMINAR',
        peligro: true,
        exito: { titulo: 'Insumo eliminado', texto: `${insumo.name} fue eliminado.` },
        onConfirmar: async () => {
          await eliminarInsumo(sesion, idDe(insumo));
          setLista((prev) => prev.filter((item) => idDe(item) !== idDe(insumo)));
        },
      });
    },
    [aviso, conToken, setLista],
  );

  return { insumos, cargando, guardando, error, recargar, guardar, eliminar };
}
