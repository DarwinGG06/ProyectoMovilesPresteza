import { Image, Pressable, ScrollView, Text, View } from 'react-native';

import Button from '@/components/Button';
import { formatCOP } from '@/services/cart/CartContext';
import { EvitarTeclado } from '@/shared/components/evitar-teclado/EvitarTeclado';
import { Pergamino } from '@/shared/components/materiales/Pergamino';
import { SelloP } from '@/shared/components/nav-bar/SelloP';

import { ModalAdmin } from '@/features/administracion/components/elementos';
import { FormularioProducto } from '@/features/administracion/components/formularios/FormularioProducto';
import { idDe } from '@/api/helpers';

import { ModelViewerModal } from '../components/ModelViewerModal';
import { useCartaAdmin } from '../hooks/useCartaAdmin';
import { useDetallePlato } from '../hooks/useDetallePlato';

export function DetallePlatoScreen() {
  const plato = useDetallePlato();
  const admin = useCartaAdmin(plato.recargar, plato.categorias);

  if (plato.cargando) {
    return (
      <View className="flex-1 items-center justify-center bg-pergamino">
        <SelloP size="md" />
        <Text className="mt-4 font-roboto text-sm text-tinta/70">Abriendo el plato...</Text>
      </View>
    );
  }

  if (!plato.producto) {
    return (
      <View className="flex-1 items-center justify-center bg-pergamino px-6">
        <Text className="text-center font-serif-light text-2xl text-tinta">
          {plato.error || 'Ese plato no está en la carta.'}
        </Text>
        <Pressable
          onPress={plato.volver}
          accessibilityRole="button"
          className="mt-6 min-h-12 justify-center">
          <Text className="font-roboto text-[11px] tracking-[2px] text-marca">VOLVER A LA CARTA</Text>
        </Pressable>
      </View>
    );
  }

  const producto = plato.producto;

  return (
    <EvitarTeclado>
      <Pergamino fill>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View>
            {producto.imageUrl ? (
              <Image source={{ uri: producto.imageUrl }} className="h-72 w-full bg-madera/15" resizeMode="cover" />
            ) : (
              <View className="h-56 items-center justify-center bg-madera/15">
                <SelloP size="lg" />
              </View>
            )}
            <Pressable
              onPress={plato.volver}
              accessibilityRole="button"
              accessibilityLabel="Volver a la carta"
              className="absolute left-5 top-5 min-h-12 justify-center bg-pergamino/90 px-3 active:opacity-80">
              <Text className="font-roboto text-[11px] tracking-[2px] text-marca">← CARTA</Text>
            </Pressable>
            {plato.tieneModelo ? (
              <Pressable
                onPress={plato.abrirVisor}
                accessibilityRole="button"
                accessibilityLabel={`Ver ${producto.name} en 3D`}
                className="absolute right-5 top-5 min-h-12 justify-center bg-marca-oscura px-3 active:opacity-80">
                <Text className="font-roboto text-[11px] tracking-[2px] text-oro">VER 3D</Text>
              </Pressable>
            ) : null}
          </View>

          <View className="px-6 pb-16 pt-7">
            <Text className="font-roboto text-[10px] tracking-[4px] text-marca">
              {plato.categoria ? plato.categoria.toUpperCase() : 'EL PLATO'}
            </Text>
            <Text className="mt-2 font-serif-light text-[40px] leading-[44px] text-tinta">
              {producto.name}
            </Text>
            <View className="mt-4 h-px w-10 bg-marca/35" />

            <Text className="mt-6 font-roboto text-[16px] leading-7 text-tinta/70">
              {plato.descripcion || 'Pregunta en mesa por la preparación.'}
            </Text>

            {plato.extras.length > 0 ? (
              <View className="mt-8">
                <Text className="font-roboto text-[10px] tracking-[2px] text-marca">ADICIONES</Text>
                {plato.extras.map((extra) => {
                  const activo = plato.extraActivo(extra);
                  return (
                    <Pressable
                      key={extra.id || extra._id || extra.name}
                      onPress={() => plato.alternarExtra(extra)}
                      accessibilityRole="button"
                      className="min-h-12 flex-row items-center border-b border-madera/20 py-3.5 active:opacity-80">
                      <Text
                        className={`flex-1 font-roboto text-[15px] ${activo ? 'text-tinta' : 'text-tinta/70'}`}>
                        {activo ? '●  ' : '○  '}
                        {extra.name}
                      </Text>
                      <Text className="font-roboto text-sm text-marca">
                        {extra.price ? `+ ${formatCOP(extra.price)}` : 'Sin cargo'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}

            {admin.esAdmin ? (
              <View className="mt-8 flex-row flex-wrap">
                <Pressable
                  onPress={() => admin.abrirEditar(producto)}
                  accessibilityRole="button"
                  className="mr-6 min-h-12 justify-center">
                  <Text className="font-roboto text-[11px] tracking-[1.6px] text-marca">EDITAR</Text>
                </Pressable>
                <Pressable
                  onPress={() => admin.eliminar(producto)}
                  accessibilityRole="button"
                  className="min-h-12 justify-center">
                  <Text className="font-roboto text-[11px] tracking-[1.6px] text-red-700">ELIMINAR</Text>
                </Pressable>
              </View>
            ) : null}

            {plato.puedePedir ? (
            <>
            <View className="mt-10 flex-row items-end justify-between">
              <View>
                <Text className="font-roboto text-[10px] tracking-[2px] text-marca">CANTIDAD</Text>
                <View className="mt-3 flex-row items-center">
                  <Pressable
                    onPress={plato.restar}
                    disabled={plato.cantidad <= 1 && !plato.enBandeja}
                    accessibilityRole="button"
                    accessibilityLabel="Quitar uno"
                    className="h-14 w-14 items-center justify-center border border-madera/30 active:bg-madera/10 disabled:opacity-30">
                    <Text className="font-serif text-[28px] leading-8 text-tinta">−</Text>
                  </Pressable>
                  <Text className="mx-5 min-w-[36px] text-center font-serif-light text-[34px] text-tinta">
                    {plato.cantidad}
                  </Text>
                  <Pressable
                    onPress={plato.sumar}
                    accessibilityRole="button"
                    accessibilityLabel="Agregar uno"
                    className="h-14 w-14 items-center justify-center border border-madera/30 active:bg-madera/10">
                    <Text className="font-serif text-[28px] leading-8 text-tinta">+</Text>
                  </Pressable>
                </View>
              </View>
              <View className="items-end">
                <Text className="font-roboto text-[10px] tracking-[2px] text-marca">TOTAL</Text>
                <Text className="mt-2 font-serif-light text-[32px] leading-9 text-marca">{plato.total}</Text>
              </View>
            </View>

            <View className="mt-8">
              {plato.enBandeja ? (
                <Text className="mb-4 font-roboto text-sm text-tinta/70">
                  En la bandeja. Toca − o + para cambiar la cantidad.
                </Text>
              ) : (
                <Button variant="gold" text="A LA BANDEJA" onPress={plato.agregar} />
              )}
              {plato.enBandeja ? (
                <Button className="mt-0" variant="gold" text="IR A PAGAR" onPress={plato.irABandeja} />
              ) : null}
            </View>
            </>
            ) : (
              <Text className="mt-10 font-roboto text-sm leading-6 text-tinta/70">
                La casa consulta la carta. Los pedidos los hacen los clientes.
              </Text>
            )}
          </View>
        </ScrollView>
      </Pergamino>

      <ModelViewerModal
        isVisible={plato.visorAbierto}
        onClose={plato.cerrarVisor}
        modelUrl={producto.modelUrl ?? null}
        productName={producto.name}
      />
      <ModalAdmin visible={admin.abierto} titulo="Editar plato" onCerrar={admin.cerrar}>
        <FormularioProducto
          key={idDe(admin.editando) || 'editar'}
          valores={admin.valoresFormulario}
          categorias={admin.categorias}
          adicionales={admin.adicionales}
          onCancelar={admin.cerrar}
          onGuardar={admin.guardar}
          guardando={admin.guardando}
        />
      </ModalAdmin>
    </EvitarTeclado>
  );
}
