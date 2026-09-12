import { useForm } from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';

import { formatCOP } from '@/services/cart/CartContext';

import type { ClienteAdmin, PedidoForm, ProductoAdmin } from '../../types';
import { idDe } from '../../utils';
import { AccionesForm } from './AccionesForm';

const PAGOS = [
  { id: 'cash', etiqueta: 'EFECTIVO' },
  { id: 'card', etiqueta: 'TARJETA' },
];

const ESTADOS = [
  { id: 'pendiente', etiqueta: 'PENDIENTE' },
  { id: 'Preparando', etiqueta: 'PREPARANDO' },
  { id: 'listo', etiqueta: 'LISTO' },
  { id: 'entregado', etiqueta: 'ENTREGADO' },
];

export function FormularioPedido({
  valores,
  clientes,
  productos,
  onCancelar,
  onGuardar,
  guardando,
}: {
  valores: PedidoForm;
  clientes: ClienteAdmin[];
  productos: ProductoAdmin[];
  onCancelar: () => void;
  onGuardar: (datos: PedidoForm) => Promise<void>;
  guardando?: boolean;
}) {
  const { handleSubmit, setValue, watch } = useForm<PedidoForm>({ defaultValues: valores });
  const userId = watch('userId');
  const pago = watch('payment_method');
  const status = watch('status');
  const lineas = watch('lineas') ?? [];
  const total = lineas.reduce((suma, linea) => suma + linea.unit_price * linea.quantity, 0);

  const agregar = (producto: ProductoAdmin) => {
    const id = idDe(producto);
    const existente = lineas.find((linea) => linea.dishId === id);
    const siguientes = existente
      ? lineas.map((linea) => (linea.dishId === id ? { ...linea, quantity: linea.quantity + 1 } : linea))
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

  return (
    <View className="gap-4">
      <View>
        <Text className="mb-2 font-semibold">Cliente</Text>
        <View className="flex-row flex-wrap gap-2">
          {clientes.map((cliente) => {
            const activo = userId === cliente.id;
            return (
              <Pressable
                key={cliente.id}
                onPress={() => setValue('userId', cliente.id)}
                className={`px-3 py-2 ${activo ? 'bg-marca-oscura' : 'border border-marca/20'}`}>
                <Text className={`text-[12px] ${activo ? 'text-crema' : 'text-marca-oscura'}`}>{cliente.name}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View>
        <Text className="mb-2 font-semibold">Pago</Text>
        <View className="flex-row flex-wrap gap-2">
          {PAGOS.map((item) => {
            const activo = pago === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => setValue('payment_method', item.id)}
                className={`px-3 py-2 ${activo ? 'bg-marca-oscura' : 'border border-marca/20'}`}>
                <Text className={`text-[12px] ${activo ? 'text-crema' : 'text-marca-oscura'}`}>{item.etiqueta}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View>
        <Text className="mb-2 font-semibold">Estado</Text>
        <View className="flex-row flex-wrap gap-2">
          {ESTADOS.map((item) => {
            const activo = status === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => setValue('status', item.id)}
                className={`px-3 py-2 ${activo ? 'bg-marca-oscura' : 'border border-marca/20'}`}>
                <Text className={`text-[12px] ${activo ? 'text-crema' : 'text-marca-oscura'}`}>{item.etiqueta}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View>
        <Text className="mb-2 font-semibold">Platos</Text>
        {productos.length === 0 ? (
          <Text className="text-sm text-texto/55">No hay platos en la carta.</Text>
        ) : (
          <View className="flex-row flex-wrap gap-2">
            {productos.map((producto) => (
              <Pressable
                key={idDe(producto)}
                onPress={() => agregar(producto)}
                className="border border-marca/20 px-3 py-2">
                <Text className="text-[12px] text-marca-oscura">{producto.name}</Text>
              </Pressable>
            ))}
          </View>
        )}
        {lineas.map((linea) => (
          <View key={linea.dishId} className="mt-3 flex-row items-center justify-between border-b border-marca/10 pb-2">
            <View className="flex-1 pr-3">
              <Text className="text-sm text-marca-oscura">{linea.name}</Text>
              <Text className="text-[12px] text-texto/55">{formatCOP(linea.unit_price)}</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <Pressable onPress={() => cambiarCantidad(linea.dishId, linea.quantity - 1)}>
                <Text className="text-lg text-marca-oscura">−</Text>
              </Pressable>
              <Text className="w-6 text-center text-sm text-marca-oscura">{linea.quantity}</Text>
              <Pressable onPress={() => cambiarCantidad(linea.dishId, linea.quantity + 1)}>
                <Text className="text-lg text-marca-oscura">+</Text>
              </Pressable>
            </View>
          </View>
        ))}
        <Text className="mt-3 text-base text-marca-oscura">Total {formatCOP(total)}</Text>
      </View>

      <AccionesForm onCancelar={onCancelar} onGuardar={handleSubmit(onGuardar)} guardando={guardando} />
    </View>
  );
}
