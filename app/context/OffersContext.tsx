"use client";

// Gives every component the current offers and price helpers.
// The root layout passes the offers it read on the server (for pages built at deploy time
// that may be old), and this provider re-fetches /api/offers once in the browser so prices
// always follow what is set in the admin panel. Every minute it re-checks start/end times.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Offer, isLive, priceCart, priceProduct, CartLine } from "@/lib/offers/engine";

type OffersValue = {
  offers: Offer[]; // live right now
  priceFor: (productId: string | number, originalPrice: number | string) => ReturnType<typeof priceProduct>;
  cartTotals: (lines: CartLine[]) => ReturnType<typeof priceCart>;
};

const OffersContext = createContext<OffersValue | null>(null);

const toNumber = (p: number | string) => (typeof p === "number" ? p : Number(String(p).replace(/[^0-9.]/g, "")) || 0);

export function OffersProvider({ initialOffers, children }: { initialOffers: Offer[]; children: React.ReactNode }) {
  const [all, setAll] = useState<Offer[]>(initialOffers);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let alive = true;
    fetch("/api/offers", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (alive && Array.isArray(d.offers)) setAll(d.offers);
      })
      .catch(() => {});
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  const offers = useMemo(() => all.filter((o) => isLive(o, now)), [all, now]);
  const priceFor = useCallback((productId: string | number, original: number | string) => priceProduct(toNumber(original), String(productId), offers, now), [offers, now]);
  const cartTotals = useCallback((lines: CartLine[]) => priceCart(lines, offers, now), [offers, now]);

  return <OffersContext.Provider value={{ offers, priceFor, cartTotals }}>{children}</OffersContext.Provider>;
}

export function useOffers(): OffersValue {
  const ctx = useContext(OffersContext);
  if (!ctx) throw new Error("useOffers must be used inside OffersProvider");
  return ctx;
}
