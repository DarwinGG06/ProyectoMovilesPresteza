import { Controller } from 'react-hook-form';
import { View } from 'react-native';

import Field from '@/components/Field';

import { useFormularioCategoria } from '../../hooks/useFormularioCategoria';
import type { CategoriaForm } from '../../types';
import { AccionesForm } from './AccionesForm';
import { CampoImagenProducto } from './CampoImagenProducto';

export function FormularioCategoria({
  valores,
  onGuardar,
  guardando,
}: {
  valores: CategoriaForm;
  onCancelar: () => void;
  onGuardar: (datos: CategoriaForm) => Promise<void>;
  guardando?: boolean;
}) {
  const formulario = useFormularioCategoria({ valores, onGuardar, guardando });

  return (
    <View className="gap-5">
      <Field
        control={formulario.control}
        name="name"
        label="Nombre"
        placeholder="Nombre"
        autoCapitalize="words"
        maxLength={60}
        variante="linea"
        rules={{ required: 'Escribe el nombre' }}
      />
      <Field
        control={formulario.control}
        name="description"
        label="Descripción"
        placeholder="Descripción"
        maxLength={300}
        variante="linea"
        rules={{ required: 'Escribe una descripción' }}
      />
      <Controller
        control={formulario.control}
        name="imageUrl"
        render={({ fieldState: { error } }) => (
          <CampoImagenProducto
            titulo="Imagen de la categoría"
            uri={formulario.preview}
            error={error?.message}
            disabled={formulario.ocupado}
            onCamara={formulario.tomarDesdeCamara}
            onGaleria={formulario.tomarDesdeGaleria}
            onArchivo={formulario.tomarDesdeArchivo}
          />
        )}
      />
      <AccionesForm
        onGuardar={formulario.guardar}
        guardando={formulario.ocupado}
        etiqueta={formulario.subiendo ? 'SUBIENDO' : 'LISTO'}
      />
    </View>
  );
}
