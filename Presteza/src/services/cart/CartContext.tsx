import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type CartOption = { name: string; price?: number };

export type CartItem = {
  id: string;
  dishId: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  selectedOptions?: CartOption[];
};

type NuevoItem = {
  id: string;
  productName: string;
  unitPrice: number;
  quantity?: number;
  selectedOptions?: CartOption[];
};

export function idLineaBandeja(dishId: string, extras?: CartOption[]) {
  return lineaId(dishId, extras);
}

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (producto: NuevoItem) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
};

function claveExtras(extras?: CartOption[]) {
  return (extras ?? [])
    .map((item) => item.name)
    .sort()
    .join('|');
}

function lineaId(dishId: string, extras?: CartOption[]) {
  const extrasClave = claveExtras(extras);
  return extrasClave ? `${dishId}::${extrasClave}` : dishId;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const value = useMemo<CartContextValue>(() => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0);

    return {
      items,
      totalItems,
      totalPrice,
      addItem: (producto) => {
        setItems((prev) => {
          const id = lineaId(producto.id, producto.selectedOptions);
          const extra = Math.max(1, producto.quantity ?? 1);
          const existente = prev.find((item) => item.id === id);
          if (existente) {
            const quantity = existente.quantity + extra;
            return prev.map((item) =>
              item.id === id
                ? { ...item, quantity, totalPrice: producto.unitPrice * quantity }
                : item,
            );
          }

          return [
            ...prev,
            {
              id,
              dishId: producto.id,
              productName: producto.productName,
              quantity: extra,
              totalPrice: producto.unitPrice * extra,
              selectedOptions: producto.selectedOptions,
            },
          ];
        });
      },
      updateQuantity: (id, quantity) => {
        if (quantity < 1) {
          setItems((prev) => prev.filter((item) => item.id !== id));
          return;
        }
        setItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  totalPrice: (item.totalPrice / item.quantity) * quantity,
                  quantity,
                }
              : item,
          ),
        );
      },
      removeItem: (id) => setItems((prev) => prev.filter((item) => item.id !== id)),
      clearCart: () => setItems([]),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
}

export function formatCOP(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}
