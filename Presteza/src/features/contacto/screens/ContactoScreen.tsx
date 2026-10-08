import { ScrollView, View } from 'react-native';

import { EvitarTeclado } from '@/shared/components/evitar-teclado/EvitarTeclado';
import { Footer } from '@/shared/components/footer';

import { FormularioContacto } from '../components/FormularioContacto';
import { HeroContacto } from '../components/HeroContacto';
import { InfoContacto } from '../components/InfoContacto';
import { useContacto } from '../hooks/useContacto';

export function ContactoScreen() {
  const contacto = useContacto();

  return (
    <EvitarTeclado>
      <View className="flex-1 bg-marca-oscura">
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag">
          <HeroContacto />
          <FormularioContacto
            control={contacto.control}
            enviar={contacto.enviar}
            enviando={contacto.enviando}
            exito={contacto.exito}
            error={contacto.error}
          />
          <InfoContacto
            contacto={contacto.contacto}
            whatsapp={contacto.whatsapp}
            llamar={contacto.llamar}
            escribirCorreo={contacto.escribirCorreo}
            abrirMapa={contacto.abrirMapa}
            abrirWhatsapp={contacto.abrirWhatsapp}
          />
          <Footer />
        </ScrollView>
      </View>
    </EvitarTeclado>
  );
}
