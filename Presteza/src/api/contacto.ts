import { request } from './client';

export type MensajeContacto = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

export function enviarMensaje(datos: MensajeContacto) {
  return request('/comments', {
    method: 'POST',
    body: {
      user_name: datos.name.trim(),
      user_email: datos.email.trim().toLowerCase(),
      user_phone: datos.phone.trim(),
      user_title: datos.subject.trim(),
      user_comment: datos.message.trim(),
    },
  });
}
