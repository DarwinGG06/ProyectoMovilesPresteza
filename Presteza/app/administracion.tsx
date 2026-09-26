import { Redirect, type Href } from 'expo-router';

export default function AdministracionRedirect() {
  return <Redirect href={'/home/admin' as Href} />;
}
