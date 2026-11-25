import { Pressable, Text, View } from 'react-native';

import { colores } from '@/theme/tokens';
import { FormularioPago } from '@/features/perfil/components/formularios/FormularioPago';
import type { TarjetaForm, TarjetaPago } from '@/features/perfil/types';

type SelectorTarjetasProps = {
  tarjetas: TarjetaPago[];
  indice: number | null;
  formularioAbierto: boolean;
  guardando: boolean;
  enviando?: boolean;
  onElegir: (indice: number) => void;
  onAbrirFormulario: () => void;
  onCancelarFormulario: () => void;
  onGuardar: (datos: TarjetaForm) => Promise<void>;
};

export function SelectorTarjetas({
  tarjetas,
  indice,
  formularioAbierto,
  guardando,
  enviando,
  onElegir,
  onAbrirFormulario,
  onCancelarFormulario,
  onGuardar,
}: SelectorTarjetasProps) {
  if (formularioAbierto) {
    return (
      <View className="mt-2 border border-madera/20 bg-crema/40 px-3 py-4">
        <Text className="mb-3 font-roboto text-[12px] tracking-[2px] text-marca">NUEVA TARJETA</Text>
        <FormularioPago
          key="checkout-nueva"
          onCancelar={onCancelarFormulario}
          onGuardar={onGuardar}
          guardando={guardando}
        />
      </View>
    );
  }

  return (
    <View className="mt-2 gap-1">
      <Text className="mb-1 font-roboto text-sm text-texto/70">
        Elige una tarjeta guardada o agrega una nueva.
      </Text>

      {tarjetas.length === 0 ? (
        <Text className="py-2 font-roboto text-sm text-tinta/60">
          Aún no tienes tarjetas. Guarda solo los últimos 4 dígitos.
        </Text>
      ) : (
        <View className="gap-2">
          {tarjetas.map((tarjeta, i) => {
            const activa = indice === i;
            return (
              <Pressable
                key={`${tarjeta.last_four_digits}-${i}`}
                disabled={enviando}
                accessibilityRole="button"
                accessibilityState={{ selected: activa, disabled: enviando }}
                onPress={() => onElegir(i)}
                style={({ pressed }) => ({
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                  ...(enviando
                    ? {
                        backgroundColor: colores['pergamino-oscuro'],
                        borderStyle: 'dashed' as const,
                      }
                    : {}),
                })}
                className={`min-h-12 justify-center border px-4 py-3 ${
                  activa ? 'border-oro bg-oro/15' : 'border-oro/35'
                }`}>
                <Text className="font-roboto text-[12px] tracking-[1.5px] text-marca-oscura">
                  {(tarjeta.brand || 'TARJETA').toUpperCase()}
                  {tarjeta.is_primary ? ' · PRINCIPAL' : ''}
                </Text>
                <Text className="mt-1 font-serif-light text-lg text-tinta">
                  •••• {tarjeta.last_four_digits}
                </Text>
                <Text className="mt-0.5 font-roboto text-xs text-tinta/70">
                  {tarjeta.name}
                  {tarjeta.expiry_date ? ` · ${tarjeta.expiry_date}` : ''}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      <Pressable
        disabled={enviando}
        accessibilityRole="button"
        accessibilityState={{ disabled: enviando }}
        onPress={onAbrirFormulario}
        style={({ pressed }) => ({
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
        className="min-h-12 justify-center py-3">
        <Text className="font-roboto text-[12px] tracking-[2px] text-marca">AGREGAR TARJETA</Text>
      </Pressable>
    </View>
  );
}
