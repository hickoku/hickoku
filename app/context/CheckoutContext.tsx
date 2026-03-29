"use client";

import React, { createContext, useReducer, ReactNode } from "react";

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CheckoutState {
  step: "address" | "shipping" | "payment" | "confirmation";
  userType: "login" | "register" | "guest" | null;
  userEmail: string;
  address: Partial<ShippingAddress>;
  shippingMethod: "standard" | "express" | "overnight" | null;
  shippingCost: number;
  paymentMethod: "razorpay" | null;
  completedSteps: string[];
}

type CheckoutAction =
  | { type: "SET_STEP"; payload: CheckoutState["step"] }
  | { type: "SET_USER_TYPE"; payload: CheckoutState["userType"] }
  | { type: "SET_USER_EMAIL"; payload: string }
  | { type: "UPDATE_ADDRESS"; payload: Partial<ShippingAddress> }
  | {
      type: "SET_SHIPPING_METHOD";
      payload: { method: "standard" | "express" | "overnight"; cost: number };
    }
  | { type: "SET_PAYMENT_METHOD"; payload: CheckoutState["paymentMethod"] }
  | { type: "MARK_STEP_COMPLETED"; payload: string }
  | { type: "RESET_CHECKOUT" };

const initialState: CheckoutState = {
  step: "address",
  userType: null,
  userEmail: "",
  address: {},
  shippingMethod: "standard", // Default to standard
  shippingCost: 0, // Defaults to 0 to safely defer to getDeliveryCharge() dynamically
  paymentMethod: null,
  completedSteps: [],
};

const checkoutReducer = (
  state: CheckoutState,
  action: CheckoutAction,
): CheckoutState => {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.payload };

    case "SET_USER_TYPE":
      return { ...state, userType: action.payload };

    case "SET_USER_EMAIL":
      return { ...state, userEmail: action.payload };

    case "UPDATE_ADDRESS":
      return { ...state, address: { ...state.address, ...action.payload } };

    case "SET_SHIPPING_METHOD":
      return {
        ...state,
        shippingMethod: action.payload.method,
        shippingCost: action.payload.cost,
      };

    case "SET_PAYMENT_METHOD":
      return { ...state, paymentMethod: action.payload };

    case "MARK_STEP_COMPLETED":
      return {
        ...state,
        completedSteps: [...new Set([...state.completedSteps, action.payload])],
      };

    case "RESET_CHECKOUT":
      return initialState;

    default:
      return state;
  }
};

interface CheckoutContextType {
  state: CheckoutState;
  dispatch: React.Dispatch<CheckoutAction>;
}

export const CheckoutContext = createContext<CheckoutContextType | undefined>(
  undefined,
);

interface CheckoutProviderProps {
  children: ReactNode;
}

export function CheckoutProvider({ children }: CheckoutProviderProps) {
  // Determine initial state based on localStorage and completed steps
  const getInitialState = (): CheckoutState => {
    if (typeof window === "undefined") return initialState;

    // Try to load from localStorage first
    const savedState = localStorage.getItem("checkoutState");
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        
        // Migration: Fix old shippingCost values (convert from paise to rupees)
        if (parsedState.shippingCost && parsedState.shippingCost >= 1000) {
          // If shippingCost is >= 1000, it's likely in paise, convert to rupees
          parsedState.shippingCost = parsedState.shippingCost / 100;
          console.log("Migrated shippingCost from paise to rupees:", parsedState.shippingCost);
        }
        
        return parsedState;
      } catch (e) {
        console.error("Failed to parse saved checkout state");
      }
    }

    // Fallback to sessionStorage for email/userType
    const state = { ...initialState };
    const savedUserType = sessionStorage.getItem("userType");
    const savedEmail = sessionStorage.getItem("guestEmail");

    if (savedUserType) {
      state.userType = savedUserType as "login" | "register" | "guest";
    }
    if (savedEmail) {
      state.userEmail = savedEmail;
    }

    // Set next step: address -> shipping -> payment -> confirmation
    const stepOrder = [
      "address",
      "shipping",
      "payment",
      "confirmation",
    ] as const;
    for (const step of stepOrder) {
      if (!state.completedSteps.includes(step)) {
        state.step = step;
        break;
      }
    }

    return state;
  };

  const [state, dispatch] = useReducer(
    checkoutReducer,
    initialState,
    getInitialState,
  );

  // Save state to localStorage whenever it changes
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("checkoutState", JSON.stringify(state));
    }
  }, [state]);

  return (
    <CheckoutContext.Provider value={{ state, dispatch }}>
      {children}
    </CheckoutContext.Provider>
  );
}
