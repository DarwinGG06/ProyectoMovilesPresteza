import { useForm } from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';

import Field from '../../../../../components/Field';
import type { CategoriaAdmin, ProductoForm } from '../../types';
import { idDe } from '../../utils';
import { AccionesForm } from './AccionesForm';

type FormularioProductoProps = {
  valores: ProductoForm;
  categorias: CategoriaAdmin[];
  onCancelar: () => void;
  onGuardar: (datos: ProductoForm) => Promise<void>;
  guardando?: boolean;
};

export function FormularioProducto({
  valores,
  categorias,
  onCancelar,
  onGuardar,
  guardando,
}: FormularioProductoProps) {
  const { control, handleSubmit, setValue, watch } = useForm<ProductoForm>({ defaultValues: valores });
  const categoriaId = watch('categoryId');

  return (
    <View className="gap-4">
      <Field
        control={control}
        name="name"
        label="Nombre"
        placeholder="Nombre del plato"
        autoCapitalize="words"
        rules={{ required: 'Escribe el nombre', minLength: { value: 3, message: 'Mínimo 3 caracteres' } }}
      />
      <Field
        control={control}
        name="description"
        label="Descripción"
        placeholder="Ingredientes y preparación"
        multiline
        rules={{ required: 'Escribe una descripción' }}
      />
      <Field
        control={control}
        name="price"
        label="Precio"
        placeholder="Precio"
        keyboardType="numeric"
        rules={{ required: 'Escribe el precio' }}
      />
      <Field control={control} name="imageUrl" label="Imagen (URL)" placeholder="https://..." />
      <View>
        <Text className="mb-2 font-semibold">Categoría</Text>
        <View className="flex-row flex-wrap gap-2">
          {categorias.map((categoria) => {
            const id = idDe(categoria);
            const activa = categoriaId === id;
            return (
              <Pressable
                key={id}
                onPress={() => setValue('categoryId', id)}
                className={`px-3 py-2 ${activa ? 'bg-marca-oscura' : 'border border-marca/20'}`}>
                <Text className={`text-[12px] ${activa ? 'text-crema' : 'text-marca-oscura'}`}>{categoria.name}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <AccionesForm onCancelar={onCancelar} onGuardar={handleSubmit(onGuardar)} guardando={guardando} />
    </View>
  );
}
