import { Redirect } from 'expo-router';

/** Sin sesión no hay folio de cuenta: se vuelve al inicio. */
export function InvitadoPerfil() {
  return <Redirect href="/home" />;
}
