export type { Categoria as CategoriaAdmin, CategoriaForm } from '@/types';
export type { Producto as ProductoAdmin, ProductoForm } from '@/types';
export type { Mesa as MesaAdmin, Reserva as ReservaAdmin } from '@/types';
export type { Cliente as ClienteAdmin } from '@/types';

export type PestanaAdmin =
  | 'dashboard'
  | 'productos'
  | 'pedidos'
  | 'categorias'
  | 'inventario'
  | 'reservas'
  | 'adicionales'
  | 'mensajes'
  | 'clientes'
  | 'ajustes';

export type PedidoAdmin = {
  _id?: string;
  id?: string;
  total: number;
  payment_method?: string;
  products?: {
    dishId?: string;
    name?: string;
    quantity?: number;
    unit_price?: number;
    adds?: { name: string; price: number }[];
  }[];
  status: string;
  user_name?: string;
  userId?: string;
  createdAt?: string;
};

export type InsumoAdmin = {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  unit_price: number;
  quantity: number;
};

export type AdicionalAdmin = {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  price: number;
  available?: boolean;
  categoryIds?: string[];
  dishIds?: string[];
};

export type MensajeAdmin = {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  read?: boolean;
  createdAt?: string;
};

export type StatsAdmin = {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalReservations: number;
  pendingReservations: number;
  totalMessages: number;
  unreadMessages: number;
  totalCustomers: number;
  totalCategorias: number;
  totalInsumos: number;
  totalAdicionales: number;
};

export type InsumoForm = {
  name: string;
  description: string;
  unit_price: string;
  quantity: string;
};

export type AdicionalForm = {
  name: string;
  price: string;
};

export type AjustesForm = {
  name: string;
  email: string;
  phone: string;
};

export type ClienteForm = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

export type LineaPedido = {
  dishId: string;
  name: string;
  quantity: number;
  unit_price: number;
  description: string;
};

export type PedidoForm = {
  userId: string;
  payment_method: string;
  status: string;
  lineas: LineaPedido[];
};

export type ReservaFormAdmin = {
  tableNumber: string;
  date: string;
  time: string;
  numberOfPeople: string;
  specialRequests: string;
};

export type MensajeForm = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};
