// Offer pricing engine. Pure functions only: safe to import on the server and in the browser.
//
// The admin panel keeps a copy of this file (admin-hickoku-v1/lib/offerEngine.ts) for its
// preview calculator. If you change the rules here, change them there too.
//
// Rules:
// 1. An offer counts only when it is enabled, has no coupon code, and "now" is inside its
//    start/end window (start inclusive, end exclusive; empty = open-ended).
// 2. Product offers change the unit price. They run in `sequence` order, each one on the
//    price left by the previous one. 50% then ₹20 off on ₹499 → 249.50 → 229.50.
// 3. Cart offers run after that on the cart subtotal, again in `sequence` order, and only
//    when their conditions (min items, min subtotal) are met.
// 4. An offer with `combinable: false` is exclusive at its level: if one applies, it is
//    the only offer applied at that level (lowest sequence wins if there are several).
// 5. A product list on an offer limits it to those products. Empty list = all products.

export type OfferLevel = "product" | "cart";
export type OfferKind = "percent" | "flat" | "per_item";

export type Offer = {
  id: string;
  name: string; // short tag shown to customers, e.g. "Launch Offer"
  title?: string; // headline, e.g. "Flat 50% Limited Launch Promo"
  message?: string; // one-line explanation shown on banners and in the cart
  level: OfferLevel;
  kind: OfferKind; // per_item is cart-only: value × number of eligible bottles
  value: number;
  productIds?: string[];
  minItems?: number;
  minSubtotal?: number;
  startsAt?: string | null; // ISO
  endsAt?: string | null; // ISO
  enabled: boolean;
  sequence: number;
  combinable: boolean;
  couponCode?: string | null; // reserved: offers with a code are never auto-applied
};

export type AppliedOffer = { id: string; name: string; amount: number };

const r2 = (n: number) => Math.round(n * 100) / 100;

export function isLive(o: Offer, now: Date = new Date()): boolean {
  if (!o.enabled || o.couponCode) return false;
  const t = now.getTime();
  if (o.startsAt && new Date(o.startsAt).getTime() > t) return false;
  if (o.endsAt && new Date(o.endsAt).getTime() <= t) return false;
  return true;
}

const appliesTo = (o: Offer, productId: string) => !o.productIds || o.productIds.length === 0 || o.productIds.includes(String(productId));

function pick(candidates: Offer[]): Offer[] {
  const sorted = [...candidates].sort((a, b) => a.sequence - b.sequence || a.id.localeCompare(b.id));
  const exclusive = sorted.find((o) => !o.combinable);
  return exclusive ? [exclusive] : sorted;
}

export type ProductPrice = {
  original: number;
  price: number;
  savings: number;
  percentOff: number; // rounded, for "50% OFF" badges; 0 when there is no discount
  applied: AppliedOffer[];
};

export function priceProduct(original: number, productId: string, offers: Offer[], now: Date = new Date()): ProductPrice {
  const base = Number(original) || 0;
  const list = pick(offers.filter((o) => o.level === "product" && isLive(o, now) && appliesTo(o, productId)));
  let price = base;
  const applied: AppliedOffer[] = [];
  for (const o of list) {
    const off = r2(Math.min(price, o.kind === "percent" ? (price * o.value) / 100 : o.value));
    if (off <= 0) continue;
    price = r2(price - off);
    applied.push({ id: o.id, name: o.name, amount: off });
  }
  const savings = r2(base - price);
  return { original: base, price, savings, percentOff: base > 0 ? Math.round((savings / base) * 100) : 0, applied };
}

export type CartLine = { productId: string; price: number; quantity: number }; // price = unit price after product offers

export type CartTotals = {
  subtotal: number;
  discount: number;
  total: number;
  totalItems: number;
  applied: AppliedOffer[];
  // The next cart offer the shopper could unlock by adding bottles, for "add 1 more" nudges.
  nextOffer: { offer: Offer; itemsNeeded: number } | null;
};

export function priceCart(lines: CartLine[], offers: Offer[], now: Date = new Date()): CartTotals {
  const subtotal = r2(lines.reduce((s, l) => s + l.price * l.quantity, 0));
  const totalItems = lines.reduce((s, l) => s + l.quantity, 0);
  const live = offers.filter((o) => o.level === "cart" && isLive(o, now));

  const eligible = (o: Offer) => {
    const ls = lines.filter((l) => appliesTo(o, l.productId));
    return { qty: ls.reduce((s, l) => s + l.quantity, 0), amount: ls.reduce((s, l) => s + l.price * l.quantity, 0) };
  };
  const qualifies = (o: Offer) => {
    const e = eligible(o);
    return e.qty > 0 && e.qty >= (o.minItems || 0) && e.amount >= (o.minSubtotal || 0);
  };

  let remaining = subtotal;
  const applied: AppliedOffer[] = [];
  for (const o of pick(live.filter(qualifies))) {
    const e = eligible(o);
    const raw = o.kind === "percent" ? (Math.min(e.amount, remaining) * o.value) / 100 : o.kind === "per_item" ? o.value * e.qty : o.value;
    const off = r2(Math.min(remaining, raw));
    if (off <= 0) continue;
    remaining = r2(remaining - off);
    applied.push({ id: o.id, name: o.name, amount: off });
  }

  const nextOffer =
    live
      .filter((o) => !applied.some((a) => a.id === o.id) && (o.minItems || 0) > eligible(o).qty)
      .sort((a, b) => a.sequence - b.sequence)
      .map((o) => ({ offer: o, itemsNeeded: (o.minItems || 0) - eligible(o).qty }))[0] || null;

  return { subtotal, discount: r2(subtotal - remaining), total: remaining, totalItems, applied, nextOffer };
}

// Short chip text for an offer: "50% OFF", "₹100 OFF", "₹25 / BOTTLE".
export function offerChip(o: Offer): { big: string; small: string } {
  const v = Number.isInteger(o.value) ? String(o.value) : o.value.toFixed(2);
  if (o.kind === "percent") return { big: `${v}%`, small: "OFF" };
  if (o.kind === "per_item") return { big: `₹${v}`, small: "PER BOTTLE" };
  return { big: `₹${v}`, small: "OFF" };
}
