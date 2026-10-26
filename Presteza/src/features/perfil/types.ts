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
  points?: number;
  pointsEarned?: number;
  pointsRedeemed?: number;
  completedOrders?: number;
  loyaltyTier?: string;
  birthDate?: string | null;
  birthdayBenefitYear?: number | null;
  birthdayInWindow?: boolean;
  birthdayEligible?: boolean;
};

export type NivelFidelidad = {
  id: string;
  name: string;
  multiplier: number;
  discountPercent: number;
  benefits: string[];
};

export type HistorialPuntos = {
  id: string;
  type: 'earn' | 'redeem' | 'refund';
  points: number;
  orderId: string | null;
  description: string | null;
  discountCop: number;
  createdAt?: string;
};

export type ProgramaFidelidad = {
  userId: string;
  points: number;
  pointsEarned: number;
  pointsRedeemed: number;
  completedOrders: number;
  tier: NivelFidelidad;
  nextTier: {
    id: string;
    name: string;
    pointsNeeded: number;
    ordersNeeded: number;
  } | null;
  rules: {
    pointCopUnit: number;
    pointValueCop: number;
    minRedeemPoints: number;
    maxRedeemPercent: number;
  };
  history: HistorialPuntos[];
};

export type CotizacionPuntos = {
  subtotal: number;
  tier: NivelFidelidad;
  tierDiscount: number;
  pointsRedeemed: number;
  pointsDiscount: number;
  discount: number;
  total: number;
  estimatedPoints: number;
  maxRedeemable: number;
  birthdayDiscount?: number;
  birthdayApplied?: boolean;
  birthdayEligible?: boolean;
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
  tipo?: 'mesa' | 'domicilio' | null;
  tableNumber?: string | null;
  deliveryAddress?: string | null;
  products: ProductoPedido[];
  status: string;
  user_name?: string;
  createdAt?: string;
};

export type { Reserva } from '@/types';

export type PestanaId =
  | 'cuenta'
  | 'puntos'
  | 'pedidos'
  | 'direcciones'
  | 'pagos'
  | 'reservas'
  | 'ajustes';

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
