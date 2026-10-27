import { useCallback } from 'react';

import { actualizarAdicional, crearAdicional, eliminarAdicional, listarAdicionales } from '@/api/admin';
import type { AdicionalAdmin, AdicionalForm } from '../types';
import { idDe } from '../utils';
import { borrarVarios, fusionar, useListaAdmin } from './adminComun';

export function useAdminAdicionales() {
  const { lista: adicionales, setLista, cargando, guardando, setGuardando, error, recargar, aviso, conToken } =
    useListaAdmin<AdicionalAdmin>(listarAdicionales);

  const guardar = useCallback(
    async (datos: AdicionalForm, editando?: AdicionalAdmin | null) => {
      const sesion = conToken();
      if (!sesion) return false;
      const cuerpo = {
        name: datos.name.trim(),
        description: datos.name.trim(),
        price: Number(datos.price),
        categoryIds: datos.categoryIds ?? [],
        available: editando?.available !== false,
      };

      setGuardando(true);
      try {
        if (editando) {
          const actualizado = await actualizarAdicional(sesion, idDe(editando), cuerpo);
          setLista((prev) => fusionar(prev, { ...editando, ...actualizado }, cuerpo));
          aviso.ok('Adicional editado', `${cuerpo.name} fue editado.`);
        } else {
          const creado = await crearAdicional(sesion, cuerpo);
          setLista((prev) => [{ ...creado, ...cuerpo }, ...prev]);
          aviso.ok('Adicional creado', `${cuerpo.name} ya está en los extras.`);
        }
        return true;
      } catch (err) {
        aviso.errorDe(err, 'No se pudo guardar.', 'Adicional');
        return false;
      } finally {
        setGuardando(false);
      }
    },
    [aviso, conToken, setGuardando, setLista],
  );

  const alternar = useCallback(
    async (adicional: AdicionalAdmin) => {
      const sesion = conToken();
      if (!sesion) return;
      const available = adicional.available === false;
      try {
        await actualizarAdicional(sesion, idDe(adicional), { available });
        setLista((prev) => fusionar(prev, adicional, { available }));
        aviso.ok(
          available ? 'Adicional activado' : 'Adicional oculto',
          available ? `${adicional.name} volvió a estar disponible.` : `${adicional.name} quedó oculto.`,
        );
      } catch (err) {
        aviso.errorDe(err, 'No se pudo actualizar.', 'Adicional');
      }
    },
    [aviso, conToken, setLista],
  );

  const eliminar = useCallback(
    (adicional: AdicionalAdmin) => {
      const sesion = conToken();
      if (!sesion) return;
      aviso.confirmar({
        sello: 'EXTRAS',
        titulo: 'Eliminar adicional',
        texto: `¿Quitar ${adicional.name} de los extras?`,
        confirmar: 'ELIMINAR',
        peligro: true,
        exito: { titulo: 'Adicional eliminado', texto: `${adicional.name} fue eliminado.` },
        onConfirmar: async () => {
          await eliminarAdicional(sesion, idDe(adicional));
          setLista((prev) => prev.filter((item) => idDe(item) !== idDe(adicional)));
        },
      });
    },
    [aviso, conToken, setLista],
  );

  const eliminarVarios = useCallback(
    (items: AdicionalAdmin[], alTerminar?: () => void) => {
      const sesion = conToken();
      if (!sesion) return;
      borrarVarios(aviso, sesion, setLista, eliminarAdicional, items, 'adicionales', 'EXTRAS', { alTerminar });
    },
    [aviso, conToken, setLista],
  );

  const vincularAPlato = useCallback(
    async (_platoId: string, adicionalIds: string[], categoryId?: string) => {
      const sesion = conToken();
      const categoria = categoryId?.trim();
      if (!sesion || !categoria) return;
      const elegidos = new Set(adicionalIds.map(String));
      const pendientes = adicionales.filter((item) => {
        const tiene = (item.categoryIds ?? []).some((id) => String(id) === categoria);
        return elegidos.has(idDe(item)) !== tiene;
      });
      if (!pendientes.length) return;

      try {
        await Promise.all(
          pendientes.map(async (item) => {
            const actual = (item.categoryIds ?? []).map(String);
            const categoryIds = elegidos.has(idDe(item))
              ? [...new Set([...actual, categoria])]
              : actual.filter((id) => id !== categoria);
            await actualizarAdicional(sesion, idDe(item), { categoryIds });
            setLista((prev) => fusionar(prev, item, { categoryIds }));
          }),
        );
      } catch (err) {
        aviso.errorDe(err, 'El plato se guardó, pero no se pudieron actualizar los adicionales.', 'Adicional');
      }
    },
    [adicionales, aviso, conToken, setLista],
  );

  return {
    adicionales,
    cargando,
    guardando,
    error,
    recargar,
    guardar,
    alternar,
    eliminar,
    eliminarVarios,
    vincularAPlato,
  };
}
