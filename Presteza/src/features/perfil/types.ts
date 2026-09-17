export type Direccion = {
  name: string;
  address: string;
  neighborhood: string;
  city: string;
  postal_code: string;
  is_primary?: boolean;
};

export type TarjetaPago = {
  name: string;
  cardholder_name: string;
  last_four_digits: string;
  type: 'debit' | 'credit';
  brand: string;
  expiry_date: string;
  is_primary?: boolean;
};

export type UsuarioPerfil = {
  id: string;
  _id?: string;
  complete_name: string;
  email: string;
  phone_number: string;
  role?: string;
  addresses: Direccion[];
  paymentCards: TarjetaPago[];
  favoriteDishes: string[];
  created_at?: string;
};

export type PlatoFavorito = {
  _id?: string;
  id?: string;
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
};

export type ProductoPedido = {
  dishId: string;
  name: string;
  quantity: number;
  unit_price: number;
  description?: string;
  adds?: { name: string; price: number }[];
};

export type Pedido = {
  _id?: string;
  id?: string;
  total: number;
  payment_method: string;
  products: ProductoPedido[];
  status: string;
  user_name?: string;
  createdAt?: string;
};

export type { Reserva } from '@/types';

export type PestanaId = 'cuenta' | 'pedidos' | 'direcciones' | 'pagos' | 'reservas' | 'ajustes';

export type DireccionForm = {
  name: string;
  address: string;
  neighborhood: string;
  is_primary: boolean;
};

export type TarjetaForm = {
  name: string;
  cardholder_name: string;
  last_four_digits: string;
  type: 'debit' | 'credit';
  brand: string;
  expiry_date: string;
  is_primary: boolean;
};

export type PerfilForm = {
  complete_name: string;
  email: string;
  phone_number: string;
};

export type ReservaForm = {
  date: string;
  time: string;
  numberOfPeople: string;
  specialRequests: string;
};

export type ContrasenaForm = {
  newPassword: string;
  confirmPassword: string;
};
