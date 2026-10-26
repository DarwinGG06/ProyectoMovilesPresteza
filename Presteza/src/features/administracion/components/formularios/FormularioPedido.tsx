import { Pressable, Text, View } from 'react-native';

import Select from '@/components/Select';
import { formatCOP } from '@/services/cart/CartContext';

import { MESAS_SALON } from '@/features/reservas/data';

import { useFormularioPedido } from '../../hooks/useFormularioPedido';
import type { ClienteAdmin, PedidoForm, ProductoAdmin } from '../../types';
import { idDe } from '../../utils';
import { AccionesForm } from './AccionesForm';
import { Paso } from './CampoStepper';

const PAGOS = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'card', label: 'Tarjeta' },
];

const ESTADOS = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'Preparando', label: 'Prep.' },
  { value: 'listo', label: 'Listo' },
  { value: 'entregado', label: 'Entregado' },
];

export function FormularioPedido({
  valores,
  clientes,
  productos,
  onCancelar: _onCancelar,
  onGuardar,
  guardando,
  bloquearCliente,
}: {
  valores: PedidoForm;
  clientes: ClienteAdmin[];
  productos: ProductoAdmin[];
  onCancelar: () => void;
  onGuardar: (datos: PedidoForm) => Promise<void>;
  guardando?: boolean;
  bloquearCliente?: boolean;
}) {
  const { control, guardar, lineas, total, agregar, cambiarCantidad, watch } = useFormularioPedido(
    valores,
    onGuardar,
  );
  const clienteFijo = clientes.find((cliente) => cliente.id === valores.userId);
  const tipo = watch('tipo');

  return (
    <View>
      {bloquearCliente ? (
        <View className="mb-2">
          <Text className="mb-1 font-roboto text-[10px] tracking-[2px] text-marca">Cliente</Text>
          <Text className="font-roboto text-base text-tinta">
            {clienteFijo?.name || 'Cliente'}
          </Text>
        </View>
      ) : clientes.length > 0 ? (
        <Select
          control={control}
          name="userId"
          label="Cliente"
          variante="fila"
          options={clientes.map((cliente) => ({ value: cliente.id, label: cliente.name }))}
          rules={{ required: 'Elige un cliente' }}
        />
      ) : (
        <Text className="font-roboto text-sm text-texto/55">No hay clientes registrados.</Text>
      )}

      <View className="mt-6">
        <Select
          control={control}
          name="tipo"
          label="Entrega"
          variante="barra"
          options={[
            { value: 'mesa', label: 'Mesa' },
            { value: 'domicilio', label: 'Domicilio' },
          ]}
          rules={{ required: 'Elige mesa o domicilio' }}
        />
      </View>

      {tipo === 'mesa' ? (
        <View className="mt-6">
          <Select
            control={control}
            name="tableNumber"
            label="Mesa"
            variante="fila"
            options={MESAS_SALON.map((mesa) => ({
              value: mesa.id,
              label: `Mesa ${mesa.id}`,
            }))}
            rules={{ required: 'Elige la mesa' }}
          />
        </View>
      ) : (
        <Text className="mt-4 font-roboto text-sm text-texto/55">
          Se usa la dirección principal del cliente.
        </Text>
      )}

      <View className="mt-6">
        <Select
          control={control}
          name="payment_method"
          label="Pago"
          variante="barra"
          options={PAGOS}
          rules={{ required: 'Elige el medio de pago' }}
        />
      </View>

      <View className="mt-6">
        <Select
          control={control}
          name="status"
          label="Estado"
          variante="barra"
          options={ESTADOS}
          rules={{ required: 'Elige el estado' }}
        />
      </View>

      <View className="mt-8">
        <Text className="mb-1 font-roboto text-[10px] tracking-[2px] text-marca">Carta</Text>
        {productos.length === 0 ? (
          <Text className="py-3 font-roboto text-sm text-texto/55">No hay platos en la carta.</Text>
        ) : (
          productos.map((producto) => {
            const id = idDe(producto);
            const linea = lineas.find((item) => item.dishId === id);
            return (
              <View
                key={id}
                className="flex-row items-center border-b border-marca/10 py-3">
                <Pressable onPress={() => agregar(producto)} className="flex-1 pr-3">
                  <Text className="font-roboto-light text-base text-marca-oscura">
                    {producto.name}
                  </Text>
                  <Text className="font-roboto text-[11px] text-texto/45">
                    {formatCOP(producto.price || 0)}
                  </Text>
                </Pressable>
                {linea ? (
                  <Paso
                    valor={linea.quantity}
                    onCambio={(cantidad) => cambiarCantidad(id, cantidad)}
                    minimo={0}
                  />
                ) : (
                  <Pressable
                    onPress={() => agregar(producto)}
                    hitSlop={8}
                    className="h-9 w-9 items-center justify-center">
                    <Text className="font-roboto-light text-2xl text-oro">+</Text>
                  </Pressable>
                )}
              </View>
            );
          })
        )}
        <View className="mt-4 flex-row items-baseline justify-between">
          <Text className="font-roboto text-[10px] tracking-[2px] text-marca">Total</Text>
          <Text className="font-roboto-light text-2xl text-marca-oscura">{formatCOP(total)}</Text>
        </View>
      </View>

      <AccionesForm onGuardar={guardar} guardando={guardando} />
    </View>
  );
}
