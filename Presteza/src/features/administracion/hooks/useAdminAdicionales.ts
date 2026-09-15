import { useCallback } from 'react';

import { actualizarAdicional, crearAdicional, eliminarAdicional, listarAdicionales } from '@/api/admin';
import type { AdicionalAdmin, AdicionalForm } from '../types';
import { idDe } from '../utils';
import { fusionar, useListaAdmin } from './adminComun';

export function useAdminAdicionales() {
  const { lista: adicionales, setLista, cargando, guardando, setGuardando, error, recargar, aviso, conToken } =
    useListaAdmin<AdicionalAdmin>(listarAdicionales);

  const guardar = useCallback(
    async (datos: AdicionalForm, editando?: AdicionalAdmin | null) => {
      const sesion = conToken();
      if (!sesion) return false;
      const cuerpo = {
        name: datos.name.trim(),
        price: Number(datos.price),
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

  return { adicionales, cargando, guardando, error, recargar, guardar, alternar, eliminar };
}
