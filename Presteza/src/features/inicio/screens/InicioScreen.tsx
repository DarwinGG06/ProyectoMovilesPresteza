import { ScrollView, View } from 'react-native';

import { EvitarTeclado } from '@/shared/components/evitar-teclado/EvitarTeclado';
import { Footer } from '@/shared/components/footer';

import { CategoriasInicio } from '../components/CategoriasInicio';
import { CtaInicio } from '../components/CtaInicio';
import { HeroInicio } from '../components/HeroInicio';
import { ProductosInicio } from '../components/ProductosInicio';
import { StatsInicio } from '../components/StatsInicio';
import { ValoresInicio } from '../components/ValoresInicio';

export function InicioScreen() {
  return (
    <EvitarTeclado>
      <View className="flex-1 bg-marca-oscura">
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
          <HeroInicio />
          <ValoresInicio />
          <ProductosInicio />
          <CategoriasInicio />
          <StatsInicio />
          <CtaInicio />
          <Footer />
        </ScrollView>
      </View>
    </EvitarTeclado>
  );
}
