import { useCallback, useEffect, useState } from 'react';

import { actualizarAdicional, listarAdicionales } from '@/api/admin';
import { idDe } from '@/api/helpers';
import { actualizarProducto, eliminarProducto } from '@/api/productos';
import { urlPublicaImagen } from '@/services/imagen/formatos';
import type { AdicionalAdmin, ProductoForm } from '@/features/administracion/types';
import { cambiosDe } from '@/features/administracion/utils';
import { useAviso } from '@/shared/components/aviso';
import { useSession } from '@/session/context';
import { esAdmin } from '@/session/roles';
import type { Categoria, Producto } from '@/types';

export function useCartaAdmin(recargar: () => void, categorias: Categoria[]) {
  const { user, token } = useSession();
  const aviso = useAviso();
  const admin = esAdmin(user);
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [adicionales, setAdicionales] = useState<AdicionalAdmin[]>([]);

  useEffect(() => {
    if (!admin || !token) return;
    void listarAdicionales(token).then(setAdicionales);
  }, [admin, token]);

  const abrirEditar = useCallback((producto: Producto) => {
    setEditando(producto);
    setAbierto(true);
  }, []);

  const cerrar = useCallback(() => setAbierto(false), []);

  const guardar = useCallback(
    async (datos: ProductoForm) => {
      if (!token || !editando) return;
      const id = idDe(editando);
      if (!id) {
        aviso.error('Producto', 'Cierra este plato y ábrelo otra vez desde la carta.');
        return;
      }
      const imagen = urlPublicaImagen(datos.imageUrl);
      const modelo = typeof datos.modelUrl === 'string' ? datos.modelUrl.trim() : '';
      if (!imagen) {
        aviso.error('Imagen', 'La foto no quedó lista. Elige la imagen otra vez y pulsa Listo.');
        return;
      }
      const actual = {
        name: (datos.name ?? '').trim(),
        description: (datos.description ?? '').trim(),
        price: Number(datos.price),
        categoryId: datos.categoryId ?? '',
        image: imagen,
        modelUrl: modelo,
      };
      const original = {
        name: editando.name,
        description: editando.description ?? '',
        price: editando.price,
        categoryId: editando.categoryId ?? '',
        image: editando.imageUrl ?? '',
        modelUrl: editando.modelUrl ?? '',
      };
      const cambios = cambiosDe(actual, original);
      const categoria = (datos.categoryId ?? '').trim();
      const elegidos = new Set((datos.adicionalIds ?? []).map(String));

      setGuardando(true);
      try {
        if (Object.keys(cambios).length) {
          await actualizarProducto(token, id, cambios);
        }

        if (categoria) {
          await Promise.all(
            adicionales
              .filter((item) => {
                const tiene = (item.categoryIds ?? []).some((id) => String(id) === categoria);
                return elegidos.has(idDe(item)) !== tiene;
              })
              .map(async (item) => {
                const actualIds = (item.categoryIds ?? []).map(String);
                const categoryIds = elegidos.has(idDe(item))
                  ? [...new Set([...actualIds, categoria])]
                  : actualIds.filter((id) => id !== categoria);
                await actualizarAdicional(token, idDe(item), { categoryIds });
              }),
          );
          setAdicionales((prev) =>
            prev.map((item) => {
              const actualIds = (item.categoryIds ?? []).map(String);
              const categoryIds = elegidos.has(idDe(item))
                ? [...new Set([...actualIds, categoria])]
                : actualIds.filter((id) => id !== categoria);
              return { ...item, categoryIds };
            }),
          );
        }

        aviso.ok('Plato editado', `${actual.name} fue actualizado.`);
        setAbierto(false);
        recargar();
      } catch (err) {
        aviso.errorDe(err, 'No se pudo guardar el plato.', 'Carta');
      } finally {
        setGuardando(false);
      }
    },
    [adicionales, aviso, editando, recargar, token],
  );

  const eliminar = useCallback(
    (producto: Producto) => {
      if (!token) return;
      aviso.confirmar({
        sello: 'CARTA',
        titulo: 'Eliminar plato',
        texto: `¿Quitar ${producto.name} de la carta?`,
        confirmar: 'ELIMINAR',
        peligro: true,
        exito: { titulo: 'Plato eliminado', texto: `${producto.name} fue eliminado de la carta.` },
        onConfirmar: async () => {
          await eliminarProducto(token, idDe(producto));
          recargar();
        },
      });
    },
    [aviso, recargar, token],
  );

  return {
    esAdmin: admin,
    abierto,
    editando,
    guardando,
    adicionales,
    categorias,
    abrirEditar,
    cerrar,
    guardar,
    eliminar,
    valoresFormulario: {
      name: editando?.name ?? '',
      description: editando?.description ?? '',
      price: editando ? String(editando.price) : '',
      categoryId: editando?.categoryId ?? idDe(categorias[0]),
      imageUrl: editando?.imageUrl ?? '',
      modelUrl: editando?.modelUrl ?? '',
      adicionalIds: adicionales
        .filter((item) =>
          (item.categoryIds ?? []).some(
            (id) => String(id) === String(editando?.categoryId ?? idDe(categorias[0])),
          ),
        )
        .map((item) => idDe(item)),
    } satisfies ProductoForm,
  };
}
