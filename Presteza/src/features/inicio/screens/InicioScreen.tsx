import { ScrollView, View } from 'react-native';

import { EvitarTeclado } from '@/shared/components/evitar-teclado/EvitarTeclado';
import { Footer } from '@/shared/components/footer';

import { CtaInicio } from '../components/CtaInicio';
import { HeroInicio } from '../components/HeroInicio';
import { ProductosInicio } from '../components/ProductosInicio';
import { StatsInicio } from '../components/StatsInicio';
import { ValoresInicio } from '../components/ValoresInicio';
import { useDestacadosInicio } from '../hooks/useDestacadosInicio';

export function InicioScreen() {
  const inicio = useDestacadosInicio();

  return (
    <EvitarTeclado>
      <View className="flex-1 bg-marca-oscura">
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag">
          <HeroInicio imagenDestacada={inicio.destacados[0]?.imageUrl} />
          <ValoresInicio />
          <ProductosInicio
            destacados={inicio.destacados}
            cargando={inicio.cargando}
          />
          <StatsInicio
            totalPlatos={inicio.totalPlatos}
            totalCategorias={inicio.totalCategorias}
            cargando={inicio.cargando}
          />
          <CtaInicio />
          <Footer />
        </ScrollView>
      </View>
    </EvitarTeclado>
  );
}
