"use client";

// The checkout's price, from the server (/api/checkout/quote), plus the discount codes the
// shopper entered. The cart drawer prices automatic offers in the browser; at checkout we
// also need codes, "first order only" and "once per customer", which only the server can
// check. Until the first quote arrives (or if it fails) the cart's own totals are shown.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "../hooks/useCart";
import { CheckoutContext } from "./CheckoutContext";

export type CodeResult = { code: string; ok: boolean; message: string; fixable?: boolean };
export type Quote = {
  subtotal: number;
  discount: number;
  total: number;
  tax: number;
  offers: { id: string; name: string; amount: number; level: string }[];
  gifts: { offerId: string; productId: string; productName: string; size: string; image: string }[];
  freeShipping: { offerId: string; name: string } | null;
  codes: CodeResult[];
};

type PricingValue = {
  subtotal: number;
  discount: number;
  total: number;
  offers: { id: string; name: string; amount: number }[]; // order-level discounts, for the summary
  gifts: Quote["gifts"];
  freeShipping: Quote["freeShipping"];
  codes: string[]; // as entered
  codeResults: CodeResult[];
  appliedCodes: string[]; // the ones that work right now: sent with the order
  quoting: boolean; // a newer quote is on its way: wait before charging
  applyCode: (code: string) => Promise<CodeResult>;
  removeCode: (code: string) => void;
  requote: () => Promise<Quote | null>;
};

const CheckoutPricingContext = createContext<PricingValue | null>(null);
const STORE_KEY = "checkoutCodes";
const norm = (c: string) => c.trim().toUpperCase();

export function CheckoutPricingProvider({ children }: { children: React.ReactNode }) {
  const { items, getSubtotal, getSurpriseDiscount, getTotalPrice, cartOffers } = useCart();
  const checkout = useContext(CheckoutContext);
  const email = checkout?.state.address.email || checkout?.state.userEmail || "";
  const phone = checkout?.state.address.phone || "";

  const [codes, setCodes] = useState<string[]>(() => {
    try {
      const v = JSON.parse(sessionStorage.getItem(STORE_KEY) || "[]");
      return Array.isArray(v) ? v.map(String) : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify(codes));
    } catch {}
  }, [codes]);

  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const seq = useRef(0);

  const fetchQuote = useCallback(
    async (withCodes: string[]): Promise<Quote | null> => {
      if (items.length === 0) return null;
      const my = ++seq.current;
      setQuoting(true);
      try {
        const r = await fetch("/api/checkout/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map((i) => ({ sku: i.sku, productId: i.productId, variantId: i.variantId, productName: i.productName, size: i.size, quantity: i.quantity, price: i.price, image: i.image })),
            codes: withCodes,
            email,
            phone,
          }),
        });
        const q: Quote | null = r.ok ? await r.json() : null;
        if (my === seq.current) setQuote(q);
        return q;
      } catch {
        if (my === seq.current) setQuote(null);
        return null;
      } finally {
        if (my === seq.current) setQuoting(false);
      }
    },
    [items, email, phone],
  );

  // Re-price whenever the cart, the codes or the customer change (debounced for typing).
  const key = JSON.stringify([items.map((i) => [i.sku, i.quantity, i.price]), codes, email, phone]);
  useEffect(() => {
    setQuoting(true);
    const t = setTimeout(() => fetchQuote(codes), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const applyCode = useCallback(
    async (raw: string): Promise<CodeResult> => {
      const code = norm(raw);
      if (!code) return { code, ok: false, message: "Enter a code." };
      const next = codes.includes(code) ? codes : [...codes, code];
      const q = await fetchQuote(next);
      const res = q?.codes.find((c) => c.code === code) || { code, ok: false, message: "Couldn't check this code. Please try again." };
      // Keep a code that may start working (e.g. "add 1 more bottle"); drop one that never will.
      const keep = res.ok || !!res.fixable;
      setCodes(keep ? next : codes);
      if (!keep) fetchQuote(codes);
      return res;
    },
    [codes, fetchQuote],
  );

  const removeCode = useCallback((code: string) => setCodes((cs) => cs.filter((c) => c !== code)), []);

  const value = useMemo<PricingValue>(() => {
    const codeResults = codes.map((c) => quote?.codes.find((r) => r.code === c) || { code: c, ok: false, message: "Checking…" });
    return {
      subtotal: quote?.subtotal ?? getSubtotal(),
      discount: quote?.discount ?? getSurpriseDiscount(),
      total: quote?.total ?? getTotalPrice(),
      offers: quote ? quote.offers.filter((o) => o.amount > 0) : cartOffers,
      gifts: quote?.gifts || [],
      freeShipping: quote?.freeShipping || null,
      codes,
      codeResults,
      appliedCodes: codeResults.filter((r) => r.ok).map((r) => r.code),
      quoting,
      applyCode,
      removeCode,
      requote: () => fetchQuote(codes),
    };
  }, [quote, codes, quoting, applyCode, removeCode, fetchQuote, getSubtotal, getSurpriseDiscount, getTotalPrice, cartOffers]);

  return <CheckoutPricingContext.Provider value={value}>{children}</CheckoutPricingContext.Provider>;
}

export function useCheckoutPricing(): PricingValue {
  const ctx = useContext(CheckoutPricingContext);
  if (!ctx) throw new Error("useCheckoutPricing must be used inside CheckoutPricingProvider");
  return ctx;
}
