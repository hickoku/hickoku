"use client";

import React, { createContext, useState, useEffect, ReactNode, useCallback } from "react";

export interface CartItem {
  id?: string; // Optional internal ID
  variantId: string; // Critical for new schema
  sku: string;
  productId: string;
  productName: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
  addedAt: string;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  surpriseDiscount: number;
  totalPrice: number;
  isOpen: boolean;
  loading: boolean;
  error: string | null;
  sessionId: string | null;
  stockWarnings: Array<{
    sku: string;
    productName: string;
    message: string;
  }>;
}

interface CartContextType {
  state: CartState;
  addToCart: (item: Omit<CartItem, 'addedAt'>) => Promise<void>;
  removeFromCart: (sku: string) => Promise<void>;
  updateQuantity: (sku: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
  refreshCart: () => Promise<void>;
}

const initialState: CartState = {
  items: [],
  totalItems: 0,
  subtotal: 0,
  surpriseDiscount: 0,
  totalPrice: 0,
  isOpen: false,
  loading: false,
  error: null,
  sessionId: null,
  stockWarnings: [],
};

export const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [state, setState] = useState<CartState>(initialState);

  // Fetch cart from API
  const fetchCart = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch('/api/cart');
      if (!response.ok) throw new Error('Failed to fetch cart');
      
      const data = await response.json();
      
      // Validate stock if cart has items
      let stockWarnings: Array<{ sku: string; productName: string; message: string }> = [];
      if (data.items && data.items.length > 0) {
        try {
          const validateResponse = await fetch('/api/cart/validate');
          if (validateResponse.ok) {
            const validation = await validateResponse.json();
            
            // Build warnings for invalid items
            if (!validation.valid) {
              stockWarnings = [
                ...validation.invalidItems.map((item: any) => ({
                  sku: item.sku,
                  productName: item.productName,
                  message: item.inStock
                    ? `Only ${item.availableQuantity} available (you have ${item.requestedQuantity})`
                    : 'Out of stock',
                })),
                ...validation.adjustments.map((adj: any) => ({
                  sku: adj.sku,
                  productName: data.items.find((i: any) => i.sku === adj.sku)?.productName || '',
                  message: `Only ${adj.suggestedQuantity} available (you have ${adj.currentQuantity})`,
                })),
              ];
            }
          }
        } catch (validationError) {
          console.error('Stock validation failed:', validationError);
        }
      }
      
      setState((prev) => ({
        ...prev,
        items: data.items || [],
        totalItems: data.totalItems || 0,
        subtotal: data.subtotal || 0,
        surpriseDiscount: data.surpriseDiscount || 0,
        totalPrice: data.totalPrice || 0,
        sessionId: data.sessionId,
        stockWarnings,
        loading: false,
      }));
    } catch (error: any) {
      console.error('Error fetching cart:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
    }
  }, []);

  // Load cart on mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add to cart
  const addToCart = async (item: Omit<CartItem, 'addedAt'>) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      // Optimistic update
      setState((prev) => {
        const existingItem = prev.items.find((i) => i.sku === item.sku);
        const optimisticItems = existingItem
          ? prev.items.map((i) =>
              i.sku === item.sku
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            )
          : [...prev.items, { ...item, addedAt: new Date().toISOString() }];

        return {
          ...prev,
          items: optimisticItems,
          isOpen: true,
          error: null,
        };
      });

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add to cart');
      }

      const data = await response.json();
      
      setState((prev) => ({
        ...prev,
        items: data.cart.items,
        totalItems: data.cart.totalItems,
        subtotal: data.cart.subtotal,
        surpriseDiscount: data.cart.surpriseDiscount,
        totalPrice: data.cart.totalPrice,
        sessionId: data.cart.sessionId,
        loading: false,
        isOpen: true,
      }));
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
      // Revert optimistic update
      await fetchCart();
      throw error;
    }
  };

  // Remove from cart
  const removeFromCart = async (sku: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      // Optimistic update
      const optimisticItems = state.items.filter((i) => i.sku !== sku);
      setState((prev) => ({ ...prev, items: optimisticItems }));

      const response = await fetch(`/api/cart/${sku}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove from cart');

      const data = await response.json();
      
      setState((prev) => ({
        ...prev,
        items: data.cart.items,
        totalItems: data.cart.totalItems,
        subtotal: data.cart.subtotal,
        surpriseDiscount: data.cart.surpriseDiscount,
        totalPrice: data.cart.totalPrice,
        loading: false,
      }));
    } catch (error: any) {
      console.error('Error removing from cart:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
      // Revert optimistic update
      await fetchCart();
    }
  };

  // Update quantity
  const updateQuantity = async (sku: string, quantity: number) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      // Optimistic update
      const optimisticItems = state.items.map((i) =>
        i.sku === sku ? { ...i, quantity } : i
      );
      setState((prev) => ({ ...prev, items: optimisticItems }));

      const response = await fetch(`/api/cart/${sku}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update quantity');
      }

      const data = await response.json();
      
      setState((prev) => ({
        ...prev,
        items: data.cart.items,
        totalItems: data.cart.totalItems,
        subtotal: data.cart.subtotal,
        surpriseDiscount: data.cart.surpriseDiscount,
        totalPrice: data.cart.totalPrice,
        loading: false,
      }));
    } catch (error: any) {
      console.error('Error updating quantity:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
      // Revert optimistic update
      await fetchCart();
      throw error;
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await fetch('/api/cart', {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to clear cart');

      setState((prev) => ({
        ...prev,
        items: [],
        totalItems: 0,
        subtotal: 0,
        surpriseDiscount: 0,
        totalPrice: 0,
        loading: false,
      }));
    } catch (error: any) {
      console.error('Error clearing cart:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
    }
  };

  // Open/close cart drawer
  const openCart = () => setState((prev) => ({ ...prev, isOpen: true }));
  const closeCart = () => setState((prev) => ({ ...prev, isOpen: false }));

  const value: CartContextType = {
    state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    openCart,
    closeCart,
    refreshCart: fetchCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
