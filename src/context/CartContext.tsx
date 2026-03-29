"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { cartApi } from "@/services/api";

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  description?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface CartContextType {
  cart: CartItem[];
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LS_KEY = "fithome-cart";

function readLocalCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as CartItem[];
    }
  } catch { /* ignore */ }
  return [];
}

function writeLocalCart(items: CartItem[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [initialized, setInitialized] = useState(false);
  const syncingRef = useRef(false);

  // Helper: convert API response items to CartItem[]
  const apiToCartItems = useCallback((apiItems: Array<{ productId: string; name: string; price: number; image: string; category: string; quantity: number }>): CartItem[] => {
    return apiItems.map((it) => ({
      id: it.productId,
      name: it.name,
      price: it.price,
      image: it.image,
      category: it.category,
      quantity: it.quantity,
    }));
  }, []);

  // Load cart on mount / when auth state changes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (token) {
        try {
          const res = await cartApi.get(token);
          if (!cancelled) {
            setItems(apiToCartItems(res.data.items));

            // Merge any guest localStorage items into the server cart
            const local = readLocalCart();
            if (local.length > 0) {
              for (const li of local) {
                try { await cartApi.add(li.id, li.quantity, token); } catch { /* ignore */ }
              }
              localStorage.removeItem(LS_KEY);
              // Re-fetch merged cart
              const merged = await cartApi.get(token);
              if (!cancelled) setItems(apiToCartItems(merged.data.items));
            }
          }
        } catch {
          // API failed — fall back to localStorage
          if (!cancelled) setItems(readLocalCart());
        }
      } else {
        // Guest: use localStorage
        if (!cancelled) setItems(readLocalCart());
      }
      if (!cancelled) setInitialized(true);
    })();
    return () => { cancelled = true; };
  }, [token, apiToCartItems]);

  // Save to localStorage for guests (when no token)
  useEffect(() => {
    if (!initialized || token || syncingRef.current) return;
    writeLocalCart(items);
  }, [items, initialized, token]);

  const addToCart = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });

    if (token) {
      cartApi.add(product.id, 1, token).catch(() => {});
    }
  }, [token]);

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));

    if (token) {
      cartApi.remove(productId, token).catch(() => {});
    }
  }, [token]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );

    if (token) {
      cartApi.update(productId, quantity, token).catch(() => {});
    }
  }, [token, removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(LS_KEY);

    if (token) {
      cartApi.clear(token).catch(() => {});
    }
  }, [token]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart: items,
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
