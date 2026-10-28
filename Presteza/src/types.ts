/**
 * El vocabulario de la app.
 *
 * El backend a veces usa otros nombres (`complete_name`, `image`...). Esa
 * traducción ocurre en `src/api/`, y de ahí para acá todo se llama igual.
 */

export const ROLES = ['admin', 'client'] as const;
export type Role = (typeof ROLES)[number];
export type Rol = Role;

/** Usuario de la sesión. Nunca incluye la contraseña ni su hash. */
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
}

export type Usuario = User;

export type RegistroDatos = {
  complete_name: string;
  email: string;
  phone_number: string;
  password: string;
};

export type Cliente = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  totalOrders?: number;
  totalReservations?: number;
  totalSpent?: number;
  points?: number;
  loyaltyTier?: string;
  birthDate?: string | null;
  birthdayEligible?: boolean;
  birthdayInWindow?: boolean;
};

// --- Productos (platos) ----------------------------------------------------

export type Producto = {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  price: number;
  categoryId?: string;
  category?: string;
  imageUrl?: string;
  /** public_id en Cloudinary: sirve para borrar la foto cuando se cambia o se borra el plato. */
  imagePublicId?: string;
  modelUrl?: string;
  /** public_id del .glb en Cloudinary (incluye la extensión). */
  modelPublicId?: string;
  type?: string;
  available?: boolean;
};

export type ProductoForm = {
  name: string;
  description: string;
  price: string;
  categoryId: string;
  imageUrl: string;
  /** Solo llega cuando se acaba de subir una foto nueva. */
  imagePublicId?: string;
  /** URL del modelo 3D (.glb) en Cloudinary. Vacío = sin modelo. */
  modelUrl: string;
  /** Solo llega cuando se acaba de subir un modelo nuevo. */
  modelPublicId?: string;
  adicionalIds?: string[];
};

// --- Categorías ------------------------------------------------------------

export type Categoria = {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  imageUrl?: string;
  /** public_id en Cloudinary: sirve para borrar la imagen al cambiarla o borrar la categoría. */
  imagePublicId?: string;
  icon?: string;
};

export type CategoriaForm = {
  name: string;
  description: string;
  imageUrl: string;
  /** Solo llega cuando se acaba de subir una imagen nueva. */
  imagePublicId?: string;
};

// --- Reservas --------------------------------------------------------------

export type EstadoReserva = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export type Reserva = {
  _id?: string;
  id?: string;
  tableNumber: string;
  date: string;
  time: string;
  numberOfPeople: number;
  specialRequests?: string;
  status: EstadoReserva | string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  createdAt?: string;
};

export type Mesa = {
  _id?: string;
  id?: string;
  number: string;
  capacity: number;
  active?: boolean;
  status?: string;
};

export type ReservaDatos = {
  tableNumber: string;
  date: string;
  time: string;
  numberOfPeople: number;
  specialRequests?: string;
};

export type AlcanceReservas = 'mias' | 'todas';
