import { Pressable, Text, View } from 'react-native';

import Select from '@/components/Select';
import { formatCOP } from '@/services/cart/CartContext';

import { useFormularioPedido } from '../../hooks/useFormularioPedido';
import type { ClienteAdmin, PedidoForm, ProductoAdmin } from '../../types';
import { idDe } from '../../utils';
import { AccionesForm } from './AccionesForm';

const PAGOS = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'card', label: 'Tarjeta' },
];

const ESTADOS = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'Preparando', label: 'Preparando' },
  { value: 'listo', label: 'Listo' },
  { value: 'entregado', label: 'Entregado' },
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
  const { control, guardar, lineas, total, agregar, cambiarCantidad } = useFormularioPedido(
    valores,
    onGuardar,
  );

  return (
    <View className="gap-4">
      {clientes.length > 0 ? (
        <Select
          control={control}
          name="userId"
          label="Cliente"
          options={clientes.map((cliente) => ({ value: cliente.id, label: cliente.name }))}
          rules={{ required: 'Elige un cliente' }}
        />
      ) : (
        <Text className="font-roboto text-sm text-texto/55">No hay clientes registrados.</Text>
      )}

      <Select
        control={control}
        name="payment_method"
        label="Pago"
        options={PAGOS}
        rules={{ required: 'Elige el medio de pago' }}
      />
      <Select
        control={control}
        name="status"
        label="Estado"
        options={ESTADOS}
        rules={{ required: 'Elige el estado' }}
      />

      <View>
        <Text className="mb-2 font-roboto-semibold text-marca-oscura">Platos</Text>
        {productos.length === 0 ? (
          <Text className="font-roboto text-sm text-texto/55">No hay platos en la carta.</Text>
        ) : (
          <View className="flex-row flex-wrap gap-2">
            {productos.map((producto) => (
              <Pressable
                key={idDe(producto)}
                onPress={() => agregar(producto)}
                className="border border-marca/20 px-3 py-2">
                <Text className="font-roboto text-[12px] text-marca-oscura">{producto.name}</Text>
              </Pressable>
            ))}
          </View>
        )}
        {lineas.map((linea) => (
          <View
            key={linea.dishId}
            className="mt-3 flex-row items-center justify-between border-b border-marca/10 pb-2">
            <View className="flex-1 pr-3">
              <Text className="font-roboto text-sm text-marca-oscura">{linea.name}</Text>
              <Text className="font-roboto text-[12px] text-texto/55">
                {formatCOP(linea.unit_price)}
              </Text>
            </View>
            <View className="flex-row items-center gap-3">
              <Pressable onPress={() => cambiarCantidad(linea.dishId, linea.quantity - 1)}>
                <Text className="font-roboto text-lg text-marca-oscura">−</Text>
              </Pressable>
              <Text className="w-6 text-center font-roboto text-sm text-marca-oscura">
                {linea.quantity}
              </Text>
              <Pressable onPress={() => cambiarCantidad(linea.dishId, linea.quantity + 1)}>
                <Text className="font-roboto text-lg text-marca-oscura">+</Text>
              </Pressable>
            </View>
          </View>
        ))}
        <Text className="mt-3 font-roboto text-base text-marca-oscura">
          Total {formatCOP(total)}
        </Text>
      </View>

      <AccionesForm
        onCancelar={onCancelar}
        onGuardar={guardar}
        guardando={guardando}
      />
    </View>
  );
}
