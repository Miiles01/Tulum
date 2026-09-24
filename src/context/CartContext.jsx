import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'tulum_cart';

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Líneas del carrito: { id, name, price, image, qty } — mismo formato que order.items en la demo.
export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* noop */ }
  }, [items]);

  function addItem(product, qty = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + qty } : i));
      return [...prev, { id: product.id, name: product.name, price: product.price, image: product.image || null, qty }];
    });
  }

  function updateQuantity(id, qty) {
    if (qty <= 0) return removeItem(id);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
  }

  function removeItem(id) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function clearCart() {
    setItems([]);
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, removeItem, clearCart, subtotal, count, drawerOpen, setDrawerOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
