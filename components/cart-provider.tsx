"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "@/lib/data";

const STORAGE_KEY = "nakisha-empire-cart";

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  hydrated: boolean;
  itemCount: number;
  subtotal: number;
  addItem: (product: Product) => void;
  removeItem: (slug: string) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setItems(JSON.parse(raw) as CartItem[]);
      }
    } catch (error) {
      console.error("Unable to restore cart", error);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [hydrated, items]);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    function addItem(product: Product) {
      setItems((currentItems) => {
        const existing = currentItems.find((entry) => entry.slug === product.slug);
        if (existing) {
          return currentItems.map((entry) =>
            entry.slug === product.slug ? { ...entry, quantity: entry.quantity + 1 } : entry
          );
        }

        return [...currentItems, { ...product, quantity: 1 }];
      });
    }

    function removeItem(slug: string) {
      setItems((currentItems) => currentItems.filter((entry) => entry.slug !== slug));
    }

    function updateQuantity(slug: string, quantity: number) {
      if (quantity <= 0) {
        removeItem(slug);
        return;
      }

      setItems((currentItems) =>
        currentItems.map((entry) => (entry.slug === slug ? { ...entry, quantity } : entry))
      );
    }

    function clearCart() {
      setItems([]);
    }

    return {
      items,
      hydrated,
      itemCount,
      subtotal,
      addItem,
      removeItem,
      updateQuantity,
      clearCart
    };
  }, [hydrated, items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}
