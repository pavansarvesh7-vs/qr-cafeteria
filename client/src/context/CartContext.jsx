import React, { createContext, useState, useEffect, useContext } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("vault_tray");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("VAULT_SYS: Failed to parse initial storage", e);
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("vault_tray", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart((prev) => {
      const pid = product.id || product._id;
      const existingIndex = prev.findIndex((item) => (item.id || item._id) === pid);

      if (existingIndex !== -1) {
        const newCart = [...prev];
        newCart[existingIndex] = { 
          ...newCart[existingIndex], 
          qty: (newCart[existingIndex].qty || 1) + 1 
        };
        return newCart;
      }
      return [...prev, { ...product, qty: 1, note: "" }];
    });
  };

  const removeFromCart = (pid) => {
    setCart((prev) => {
      const existingItem = prev.find(item => (item.id || item._id) === pid);
      if (existingItem?.qty > 1) {
        return prev.map(item => 
          (item.id || item._id) === pid ? { ...item, qty: item.qty - 1 } : item
        );
      }
      return prev.filter(item => (item.id || item._id) !== pid);
    });
  };

  const updateCustomization = (pid, note) => {
    setCart((prev) =>
      prev.map((item) =>
        (item.id || item._id) === pid ? { ...item, note: note } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("vault_tray");
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.qty), 0);
  };

  const getCartCount = () => {
    return cart.reduce((total, item) => total + (item.qty || 0), 0);
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      clearCart, 
      updateCustomization,
      getCartTotal,
      getCartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

// --- ADDED EXPORTS ---

/**
 * Custom Hook: useCart
 * Allows components to access cart logic easily:
 * const { cart, addToCart } = useCart();
 */
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

// Default export for the Provider
export default CartProvider;