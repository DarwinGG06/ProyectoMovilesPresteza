import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type CartItem = {
  id: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  selectedOptions?: { name: string }[];
};

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
};

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
      updateQuantity: (id, quantity) => {
        if (quantity < 1) return;
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
