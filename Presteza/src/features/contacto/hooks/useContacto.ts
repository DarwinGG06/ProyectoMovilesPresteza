import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Linking } from 'react-native';

import { enviarMensaje, type MensajeContacto } from '@/api/contacto';

import { CONTACTO, WHATSAPP } from '../data';

export function useContacto() {
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, reset } = useForm<MensajeContacto>({
    defaultValues: { name: '', email: '', phone: '', subject: '', message: '' },
  });

  const enviar = handleSubmit(async (datos) => {
    setError(null);
    setExito(false);
    setEnviando(true);
    try {
      await enviarMensaje(datos);
      reset();
      setExito(true);
    } catch (err) {
      setError((err as Error).message || 'No se pudo enviar el mensaje. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  });

  return {
    control,
    enviar,
    enviando,
    exito,
    error,
    contacto: CONTACTO,
    whatsapp: WHATSAPP,
    llamar: () => void Linking.openURL(`tel:${CONTACTO.telefono}`),
    escribirCorreo: () => void Linking.openURL(`mailto:${CONTACTO.email}`),
    abrirMapa: () => void Linking.openURL(CONTACTO.mapa),
    abrirWhatsapp: () => void Linking.openURL(WHATSAPP.url),
  };
}
