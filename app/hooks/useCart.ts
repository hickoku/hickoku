"use client";

import { useContext } from "react";
import { CartContext } from "../context/CartContext";

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  const {
    state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    openCart,
    closeCart,
    refreshCart,
  } = context;

  const getTotalPrice = () => {
    return state.totalPrice; // Return in paise for calculations
  };

  const getSubtotal = () => {
    return state.subtotal;
  };

  const getSurpriseDiscount = () => {
    return state.surpriseDiscount;
  };

  const getCartItemCount = () => {
    return state.totalItems;
  };

  return {
    items: state.items,
    isOpen: state.isOpen,
    loading: state.loading,
    isCartLoaded: state.isCartLoaded,
    error: state.error,
    sessionId: state.sessionId,
    stockWarnings: state.stockWarnings,
    addToCart,
    removeFromCart,
    updateQuantity,
    openCart,
    closeCart,
    clearCart,
    refreshCart,
    getTotalPrice,
    getSubtotal,
    getSurpriseDiscount,
    getCartItemCount,
  };
}
