// Offer pricing engine. Pure functions only: safe to import on the server and in the browser.
//
// The admin panel (hickoku-admin lib/offerEngine.ts) has a COPY of this file for its price
// preview. This version decides real prices: change both together.
//
// Offer types (`level`):
//   product   Lowers the unit price shown on products.
//   cart      Amount off the order (percent, fixed, or per bottle).
//   bxgy      Buy X get Y: the cheapest Y of the qualifying bottles become free or cheaper.
//   gift      Adds a free product when the cart meets the conditions.
//   shipping  Makes delivery free when the cart meets the conditions.
//
// Rules:
// 1. An offer counts only when it is enabled, "now" is inside its start/end window
//    (start inclusive, end exclusive; empty = open-ended) and its usage limit isn't used up.
// 2. Product offers change the unit price. They run in `sequence` order, each one on the
//    price left by the previous one. 50% then ₹20 off on ₹499 → 249.50 → 229.50.
//    Product offers are always automatic and for everyone (the price is shown before checkout).
// 3. Order offers (bxgy, then cart) run after that on the cart, again in `sequence` order,
//    and only when their conditions (min items, min subtotal) are met.
// 4. An offer with `combinable: false` is exclusive at its stage: if one applies, it is the
//    only offer applied at that stage (lowest sequence wins). Stages: product / order.
//    Free gifts and free shipping don't lower prices, so they always combine.
// 5. A product list on an offer limits it to those products. Empty list = all products.
// 6. An offer with a coupon code applies only when the shopper enters that code. An offer
//    for "first order" applies only when the checkout knows this is the customer's first
//    order. Usage limits per customer are checked by the store when the order is placed.

export type OfferLevel = "product" | "cart" | "bxgy" | "gift" | "shipping";
export type OfferKind = "percent" | "flat" | "per_item";
export type OfferEligibility = "everyone" | "first_order";

export type Offer = {
  id: string;
  name: string; // short tag shown to customers, e.g. "Launch Offer"
  title?: string; // headline, e.g. "Flat 50% Limited Launch Promo"
  message?: string; // one-line explanation shown on banners and in the cart
  badge?: string; // short text on product cards, e.g. "BUY 2 GET 1"
  level: OfferLevel;
  kind: OfferKind; // product/cart only. per_item is cart-only: value × number of eligible bottles
  value: number; // product/cart only
  maxDiscount?: number; // cart percent only: most ₹ this offer can take off. 0 = no cap
  productIds?: string[]; // product/cart/bxgy: which products count. Empty = all
  minItems?: number; // order offers: bottles needed
  minSubtotal?: number; // order offers: cart value needed (after product offers)
  // Buy X get Y
  buyQty?: number;
  getQty?: number;
  getProductIds?: string[]; // which bottles can be the free ones. Empty = the same as productIds
  getKind?: "free" | "percent";
  getValue?: number; // percent off the "get" bottles when getKind is percent
  // Free gift
  giftProductId?: string | null;
  // Who and how often
  eligibility?: OfferEligibility;
  usageLimit?: number; // total orders that can use it. 0 = no limit
  oncePerCustomer?: boolean;
  usedCount?: number; // written by the store when orders are placed
  startsAt?: string | null; // ISO
  endsAt?: string | null; // ISO
  enabled: boolean;
  sequence: number;
  combinable: boolean;
  couponCode?: string | null; // set = applies only when the shopper enters this code
};

export type AppliedOffer = { id: string; name: string; amount: number };

// What the checkout knows about the shopper.
export type PricingContext = { codes?: string[]; firstOrder?: boolean };

const r2 = (n: number) => Math.round(n * 100) / 100;
export const normaliseCode = (c: unknown) => String(c ?? "").trim().toUpperCase();

export function isLive(o: Offer, now: Date = new Date()): boolean {
  if (!o.enabled) return false;
  const t = now.getTime();
  if (o.startsAt && new Date(o.startsAt).getTime() > t) return false;
  if (o.endsAt && new Date(o.endsAt).getTime() <= t) return false;
  if (o.usageLimit && (o.usedCount || 0) >= o.usageLimit) return false;
  return true;
}

// Live, and this shopper is allowed it (code entered, first order if required).
function usable(o: Offer, now: Date, ctx: PricingContext): boolean {
  if (!isLive(o, now)) return false;
  if (o.couponCode && !(ctx.codes || []).map(normaliseCode).includes(normaliseCode(o.couponCode))) return false;
  if (o.eligibility === "first_order" && ctx.firstOrder !== true) return false;
  return true;
}

const inList = (ids: string[] | undefined, productId: string) => !ids || ids.length === 0 || ids.includes(String(productId));
const appliesTo = (o: Offer, productId: string) => inList(o.productIds, productId);

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
  // Product offers never use codes or eligibility (see rule 2), so a code on one is ignored.
  const list = pick(offers.filter((o) => o.level === "product" && !o.couponCode && isLive(o, now) && appliesTo(o, productId)));
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
  // Free products to add to the order (price 0).
  gifts: { offerId: string; name: string; productId: string }[];
  // Set when delivery should be free.
  freeShipping: { offerId: string; name: string } | null;
  // The next automatic offer the shopper could unlock by adding bottles, for "add 1 more" nudges.
  nextOffer: { offer: Offer; itemsNeeded: number } | null;
};

// Buy X get Y: how much comes off. Each "set" is buyQty paid bottles + getQty discounted ones,
// and the discounted ones are always the cheapest qualifying bottles.
function bxgyDiscount(o: Offer, lines: CartLine[]): number {
  const buy = Math.max(1, o.buyQty || 1);
  const get = Math.max(1, o.getQty || 1);
  const pct = o.getKind === "percent" ? Math.min(100, Math.max(0, o.getValue || 0)) : 100;
  const units = (pred: (l: CartLine) => boolean) => lines.filter(pred).flatMap((l) => Array.from({ length: l.quantity }, () => l.price));
  let discounted: number[];
  if (!o.getProductIds || o.getProductIds.length === 0) {
    // One pool: every (buy + get) bottles, the cheapest `get` are discounted.
    const pool = units((l) => appliesTo(o, l.productId)).sort((a, b) => a - b);
    const sets = Math.floor(pool.length / (buy + get));
    discounted = pool.slice(0, sets * get);
  } else {
    // Two pools: buying `buy` bottles from the first list unlocks `get` from the second.
    const getPool = units((l) => inList(o.getProductIds, l.productId)).sort((a, b) => a - b);
    const buyCount = units((l) => appliesTo(o, l.productId) && !inList(o.getProductIds, l.productId)).length;
    const sets = Math.floor(buyCount / buy);
    discounted = getPool.slice(0, sets * get);
  }
  return r2(discounted.reduce((s, p) => s + (p * pct) / 100, 0));
}

export function priceCart(lines: CartLine[], offers: Offer[], now: Date = new Date(), ctx: PricingContext = {}): CartTotals {
  const subtotal = r2(lines.reduce((s, l) => s + l.price * l.quantity, 0));
  const totalItems = lines.reduce((s, l) => s + l.quantity, 0);
  const live = offers.filter((o) => o.level !== "product" && usable(o, now, ctx));

  const eligible = (o: Offer) => {
    const ls = lines.filter((l) => appliesTo(o, l.productId));
    return { qty: ls.reduce((s, l) => s + l.quantity, 0), amount: ls.reduce((s, l) => s + l.price * l.quantity, 0) };
  };
  const qualifies = (o: Offer) => {
    const e = eligible(o);
    return e.qty > 0 && e.qty >= (o.minItems || 0) && e.amount >= (o.minSubtotal || 0);
  };

  // Order stage: Buy X get Y first (it works on bottles), then amount-off-order offers.
  const order = pick(live.filter((o) => (o.level === "bxgy" || o.level === "cart") && qualifies(o))).sort(
    (a, b) => (a.level === b.level ? 0 : a.level === "bxgy" ? -1 : 1),
  );
  let remaining = subtotal;
  const applied: AppliedOffer[] = [];
  for (const o of order) {
    let raw: number;
    if (o.level === "bxgy") raw = bxgyDiscount(o, lines);
    else {
      const e = eligible(o);
      raw = o.kind === "percent" ? (Math.min(e.amount, remaining) * o.value) / 100 : o.kind === "per_item" ? o.value * e.qty : o.value;
      if (o.kind === "percent" && o.maxDiscount && o.maxDiscount > 0) raw = Math.min(raw, o.maxDiscount);
    }
    const off = r2(Math.min(remaining, raw));
    if (off <= 0) continue;
    remaining = r2(remaining - off);
    applied.push({ id: o.id, name: o.name, amount: off });
  }

  // Free gifts and free shipping use the same conditions as other order offers
  // (bottles and subtotal after product offers, before order discounts).
  const gifts = live
    .filter((o) => o.level === "gift" && o.giftProductId && qualifies(o))
    .sort((a, b) => a.sequence - b.sequence)
    .map((o) => ({ offerId: o.id, name: o.name, productId: String(o.giftProductId) }));
  const ship = live.filter((o) => o.level === "shipping" && qualifies(o)).sort((a, b) => a.sequence - b.sequence)[0];

  const nextOffer =
    live
      .filter((o) => !o.couponCode && !applied.some((a) => a.id === o.id) && (o.minItems || 0) > eligible(o).qty)
      .sort((a, b) => a.sequence - b.sequence)
      .map((o) => ({ offer: o, itemsNeeded: (o.minItems || 0) - eligible(o).qty }))[0] || null;

  return {
    subtotal,
    discount: r2(subtotal - remaining),
    total: remaining,
    totalItems,
    applied,
    gifts,
    freeShipping: ship ? { offerId: ship.id, name: ship.name } : null,
    nextOffer,
  };
}

// Short chip text for an offer: "50% OFF", "₹100 OFF", "₹25 / BOTTLE", "BUY 2 / GET 1".
export function offerChip(o: Offer): { big: string; small: string } {
  const v = Number.isInteger(o.value) ? String(o.value) : (o.value || 0).toFixed(2);
  if (o.level === "bxgy") return { big: `${o.buyQty || 1}+${o.getQty || 1}`, small: o.getKind === "percent" ? `${o.getValue || 0}% OFF` : "FREE" };
  if (o.level === "gift") return { big: "FREE", small: "GIFT" };
  if (o.level === "shipping") return { big: "FREE", small: "DELIVERY" };
  if (o.kind === "percent") return { big: `${v}%`, small: "OFF" };
  if (o.kind === "per_item") return { big: `₹${v}`, small: "PER BOTTLE" };
  return { big: `₹${v}`, small: "OFF" };
}
