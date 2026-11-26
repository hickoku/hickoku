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
  shippingLoading?: boolean;
  paymentMethod: "razorpay" | null;
  completedSteps: string[];
  isDelhiveryEnabled: boolean;
  // From /api/checkout/config (admin Settings → Checkout switches)
  isShippingCharged?: boolean; // add the delivery fee to the total (else shown as FREE)
  isGeolocationEnabled?: boolean; // "Use Current Location" button
  flatDeliveryFee?: number; // fee when Delhivery gives no rate
  configLoaded?: boolean; // pay button waits for this so the total includes the right fee
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
  | { type: "SET_SHIPPING_LOADING"; payload: boolean }
  | { type: "SET_DELHIVERY_CONFIG"; payload: boolean }
  | {
      type: "SET_CHECKOUT_CONFIG";
      payload: { enableDelhivery: boolean; chargeShipping: boolean; enableGeolocation: boolean; flatDeliveryFee: number };
    }
  | { type: "SET_SERVER_DELIVERY"; payload: { fee: number; charged: boolean } }
  | { type: "RESET_CHECKOUT" };

const initialState: CheckoutState = {
  step: "address",
  userType: null,
  userEmail: "",
  address: {},
  shippingMethod: "standard", // Default to standard
  shippingCost: 0, // 0 = no Delhivery rate yet; deliveryFee() then uses the flat fee
  shippingLoading: false,
  paymentMethod: null,
  completedSteps: [],
  isDelhiveryEnabled: true,
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

    case "SET_SHIPPING_LOADING":
      return { ...state, shippingLoading: action.payload };

    case "SET_DELHIVERY_CONFIG":
      return { ...state, isDelhiveryEnabled: action.payload };

    case "SET_CHECKOUT_CONFIG":
      return {
        ...state,
        isDelhiveryEnabled: action.payload.enableDelhivery,
        isShippingCharged: action.payload.chargeShipping,
        isGeolocationEnabled: action.payload.enableGeolocation,
        flatDeliveryFee: action.payload.flatDeliveryFee,
        // A Delhivery rate saved from an earlier visit no longer applies once Delhivery is off
        shippingCost: action.payload.enableDelhivery ? state.shippingCost : 0,
        configLoaded: true,
      };

    case "SET_SERVER_DELIVERY": // the order step told us the real fee
      return { ...state, shippingCost: action.payload.fee, isShippingCharged: action.payload.charged };

    case "RESET_CHECKOUT": // keep the switches already read from the server
      return {
        ...initialState,
        isDelhiveryEnabled: state.isDelhiveryEnabled,
        isShippingCharged: state.isShippingCharged,
        isGeolocationEnabled: state.isGeolocationEnabled,
        flatDeliveryFee: state.flatDeliveryFee,
        configLoaded: state.configLoaded,
      };

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
        
        return { ...parsedState, configLoaded: false }; // switches are re-read on every visit
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

  // Fetch Delhivery Config on mount
  React.useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/checkout/config", { cache: "no-store" });
        const data = await res.json();
        dispatch({
          type: "SET_CHECKOUT_CONFIG",
          payload: {
            enableDelhivery: data.enableDelhivery === true,
            chargeShipping: data.chargeShipping === true,
            enableGeolocation: data.enableGeolocation === true,
            flatDeliveryFee: Number(data.flatDeliveryFee) || 50,
          },
        });
      } catch (e) {
        console.error("Failed to fetch checkout config", e);
        // Don't block payment; the server works out the real total and the order step
        // returns the correct delivery fee if this guess is wrong.
        dispatch({
          type: "SET_CHECKOUT_CONFIG",
          payload: { enableDelhivery: true, chargeShipping: false, enableGeolocation: false, flatDeliveryFee: 50 },
        });
      }
    };
    fetchConfig();
  }, []);

  return (
    <CheckoutContext.Provider value={{ state, dispatch }}>
      {children}
    </CheckoutContext.Provider>
  );
}

/** Delivery fee shown at checkout: the quoted rate, else the flat fee (₹50). */
export function deliveryFee(state: CheckoutState): number {
  return state.shippingCost > 0 ? state.shippingCost : state.flatDeliveryFee || 50;
}

/** What the customer pays on top of the items: the fee when "Charge shipping" is on, else 0. */
export function chargedDelivery(state: CheckoutState): number {
  return state.isShippingCharged ? deliveryFee(state) : 0;
}
