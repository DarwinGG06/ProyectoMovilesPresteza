import { useFormulario } from '@/shared/hooks/useFormulario';

import type { PedidoForm, ProductoAdmin } from '../types';
import { idDe } from '../utils';

export function useFormularioPedido(
  valores: PedidoForm,
  onGuardar: (datos: PedidoForm) => Promise<void>,
) {
  const { control, handleSubmit, setValue, watch } = useFormulario(valores, onGuardar);
  const lineas = watch('lineas') ?? [];
  const total = lineas.reduce((suma, linea) => suma + linea.unit_price * linea.quantity, 0);

  const agregar = (producto: ProductoAdmin) => {
    const id = idDe(producto);
    const existente = lineas.find((linea) => linea.dishId === id);
    const siguientes = existente
      ? lineas.map((linea) =>
          linea.dishId === id ? { ...linea, quantity: linea.quantity + 1 } : linea,
        )
      : [
          ...lineas,
          {
            dishId: id,
            name: producto.name,
            quantity: 1,
            unit_price: producto.price || 0,
            description: producto.description || producto.name,
          },
        ];
    setValue('lineas', siguientes, { shouldDirty: true });
  };

  const cambiarCantidad = (dishId: string, quantity: number) => {
    if (quantity < 1) {
      setValue(
        'lineas',
        lineas.filter((linea) => linea.dishId !== dishId),
        { shouldDirty: true },
      );
      return;
    }
    setValue(
      'lineas',
      lineas.map((linea) => (linea.dishId === dishId ? { ...linea, quantity } : linea)),
      { shouldDirty: true },
    );
  };

  return { control, guardar: handleSubmit(onGuardar), lineas, total, agregar, cambiarCantidad };
}
