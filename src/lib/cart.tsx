import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "./supabase";

export interface CartItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  image: string | null;
  quantity: number;
  metal?: "silver" | "gold";
}

export interface AddItemOptions {
  quantity?: number;
  metal?: "silver" | "gold";
  price?: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, options?: AddItemOptions | number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clear: () => void;
}

const STORAGE_KEY = "veza:cart:v1";
const CartContext = createContext<CartContextValue | null>(null);

function loadInitial(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as CartItem[];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setItems(loadInitial());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore quota */
    }
  }, [items, hydrated]);

  const addItem = useCallback((product: Product, options: AddItemOptions | number = {}) => {
    const opts: AddItemOptions = typeof options === "number" ? { quantity: options } : options;
    const quantity = opts.quantity ?? 1;
    const metal = opts.metal;
    const price = opts.price ?? Number(product.price);
    const lineKey = metal ? `${product.id}:${metal}` : product.id;
    setItems((prev) => {
      const existing = prev.find((i) => i.id === lineKey);
      if (existing) {
        return prev.map((i) =>
          i.id === lineKey ? { ...i, quantity: i.quantity + quantity } : i,
        );
      }
      const image =
        product.images && product.images.length > 0 ? product.images[0].url : null;
      return [
        ...prev,
        {
          id: lineKey,
          slug: product.slug,
          name: metal ? `${product.name} — ${metal === "gold" ? "9ct Gold" : "925 Silver"}` : product.name,
          price,
          currency: product.currency,
          image,
          quantity,
          metal,
        },
      ];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) => (i.id === id ? { ...i, quantity } : i)),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((n, i) => n + i.quantity, 0);
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    return {
      items,
      count,
      subtotal,
      isOpen,
      openCart,
      closeCart,
      addItem,
      removeItem,
      updateQuantity,
      clear,
    };
  }, [items, isOpen, addItem, removeItem, updateQuantity, clear, openCart, closeCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function formatPrice(price: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `${currency} ${price.toFixed(0)}`;
  }
}
