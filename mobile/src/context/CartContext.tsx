// CartContext.tsx
// Provides global cart state: add, remove, clear, and list cart items.

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Shape of each item in the cart
export type CartItem = {
  id: string;
  name: string;
  chef: string;
  price: number;
  quantity: number;
};

// What our context exposes
type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

// Wrap your app in this provider (in App.tsx)
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  function addItem(item: Omit<CartItem, 'quantity'>) {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        // If already in cart, increment quantity
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      // Otherwise add as new with quantity 1
      return [...prev, { ...item, quantity: 1 }];
    });
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function clearCart() {
    setItems([]);
  }

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook to consume the cart context
export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
