// Prices an order on the server: products from the product tables, offers from the
// admin's Offers page, and what this customer has used before. Server-only.
// Used by checkout quotes (/api/checkout/quote) and when the order is created, so the
// total the shopper sees and the amount charged come from the same code.
import { getProductWithVariant } from "@/app/repositories/products.repository";
import type { OrderItem } from "@/lib/repositories/orderRepository";
import { getOffers } from "./repository";
import { customerHistory } from "./customers";
import { isLive, normaliseCode, priceCart, priceProduct, type Offer } from "./engine";

const GST_RATE = 18; // prices are GST-inclusive
const MAX_CODES = 3;

export class PriceError extends Error {}

export type PricedOffer = { id: string; name: string; amount: number; level: Offer["level"] };
// fixable: the shopper can still make it work (add bottles, spend more, enter their email).
export type CodeResult = { code: string; ok: boolean; message: string; fixable?: boolean };

export type OrderPricing = {
  items: OrderItem[]; // paid items, then free gift lines (price 0, gift: true)
  subtotal: number;
  cartDiscount: number;
  total: number;
  tax: number;
  appliedOffers: PricedOffer[]; // every offer used, including free gifts / delivery (amount 0)
  gifts: OrderItem[];
  freeShipping: { offerId: string; name: string } | null;
  codes: CodeResult[]; // one per code the shopper entered
};

type Customer = { email?: string | null; phone?: string | null };
// fresh: read offers straight from the table (when charging). Quotes may use the 30s cache.
type Options = { fresh?: boolean };

const r2 = (n: number) => Math.round(n * 100) / 100;
const inr = (n: number) => "₹" + Math.ceil(n).toLocaleString("en-IN");

export async function priceOrder(input: Partial<OrderItem>[], rawCodes: unknown, customer: Customer, { fresh = true }: Options = {}): Promise<OrderPricing> {
  const now = new Date();
  const all = await getOffers({ fresh });
  const entered = [...new Set((Array.isArray(rawCodes) ? rawCodes : []).map(normaliseCode).filter(Boolean))];
  const codes = entered.slice(0, MAX_CODES);

  // --- Products and product offers ---
  const products = new Map<string, Awaited<ReturnType<typeof getProductWithVariant>>>();
  const loadProduct = async (pid: string) => {
    if (!products.has(pid)) products.set(pid, await getProductWithVariant(pid));
    return products.get(pid);
  };
  const priced: OrderItem[] = [];
  const productOffers = new Map<string, PricedOffer>();
  for (const item of input) {
    const qty = Math.floor(Number(item.quantity));
    if (!Number.isFinite(qty) || qty < 1 || qty > 10) throw new PriceError(`Invalid quantity for ${item.sku}`);
    const pid = String(item.productId);
    const product = await loadProduct(pid);
    const variant = product?.variants.find((v) => v.sku === item.sku) || product?.variants.find((v) => String(v.id) === String(item.variantId));
    if (!product || !variant || product.hidden || variant.status === false) throw new PriceError(`${item.productName || item.sku} is no longer available`);
    const p = priceProduct(Number(variant.price), pid, all, now);
    for (const a of p.applied) {
      const prev = productOffers.get(a.id);
      productOffers.set(a.id, { id: a.id, name: a.name, amount: r2((prev?.amount || 0) + a.amount * qty), level: "product" });
    }
    const { gift: _g, offerId: _o, ...rest } = item; // only the server adds gift lines
    priced.push({ ...(rest as OrderItem), productId: pid, sku: variant.sku, variantId: String(variant.id), quantity: qty, price: p.price, total: r2(p.price * qty) });
  }

  // --- Who is this customer (only looked up when an offer needs it) ---
  const live = all.filter((o) => o.level !== "product" && isLive(o, now));
  const needsHistory = live.some((o) => o.eligibility === "first_order" || o.oncePerCustomer);
  let history = { known: false, firstOrder: false, usedOfferIds: new Set<string>() };
  if (needsHistory) {
    try {
      history = await customerHistory(customer.email, customer.phone, live.filter((o) => o.oncePerCustomer).map((o) => o.id));
    } catch (e) {
      // Can't check: give no first-order or once-per-customer discounts rather than guess.
      console.error("Offer customer lookup failed:", e);
    }
  }
  // Once-per-customer offers this customer can't have (already used, or we don't know who they are yet).
  const blocked = (o: Offer) => !!o.oncePerCustomer && (!history.known || history.usedOfferIds.has(o.id));
  const offers = all.filter((o) => !blocked(o));

  const lines = priced.map((i) => ({ productId: String(i.productId), price: i.price, quantity: i.quantity }));
  const cart = priceCart(lines, offers, now, { codes, firstOrder: history.known && history.firstOrder });

  // --- Free gifts: the cheapest in-stock size of the gift product ---
  const gifts: OrderItem[] = [];
  for (const g of cart.gifts) {
    const product = await loadProduct(g.productId).catch(() => null);
    const variant = product && !product.hidden
      ? [...product.variants].filter((v) => v.status !== false && Number(v.stock) > 0).sort((a, b) => Number(a.price) - Number(b.price))[0]
      : undefined;
    if (!product || !variant) {
      console.warn(`Free gift ${g.productId} (offer ${g.offerId}) is unavailable; skipped`);
      continue;
    }
    gifts.push({
      sku: variant.sku,
      productId: String(product.id),
      variantId: String(variant.id),
      productName: product.name,
      size: variant.size,
      quantity: 1,
      price: 0,
      image: product.images?.[0] || "",
      total: 0,
      gift: true,
      offerId: g.offerId,
    });
  }

  const levelOf = (id: string) => all.find((o) => o.id === id)?.level || "cart";
  const appliedOffers: PricedOffer[] = [
    ...productOffers.values(),
    ...cart.applied.map((a) => ({ ...a, level: levelOf(a.id) })),
    ...gifts.map((g) => ({ id: g.offerId!, name: cart.gifts.find((x) => x.offerId === g.offerId)?.name || "Free gift", amount: 0, level: "gift" as const })),
    ...(cart.freeShipping ? [{ id: cart.freeShipping.offerId, name: cart.freeShipping.name, amount: 0, level: "shipping" as const }] : []),
  ];

  // --- A plain-words result for every code the shopper typed ---
  const usedIds = new Set(appliedOffers.map((a) => a.id));
  const codeResults: CodeResult[] = codes.map((code) => {
    const matches = all.filter((o) => o.couponCode && normaliseCode(o.couponCode) === code);
    const o = matches.find((m) => usedIds.has(m.id)) || matches.find((m) => isLive(m, now)) || matches[0];
    if (!o || o.level === "product" || !isLive(o, now)) return { code, ok: false, message: "This code isn't valid or has expired." };
    if (usedIds.has(o.id)) return { code, ok: true, message: o.message || o.title || o.name };
    if (o.oncePerCustomer && !history.known) return { code, ok: false, message: "Add your email and phone number first, then apply this code.", fixable: true };
    if (o.oncePerCustomer && history.usedOfferIds.has(o.id)) return { code, ok: false, message: "You've already used this code." };
    if (o.eligibility === "first_order") {
      if (!history.known) return { code, ok: false, message: "This code is for first orders. Add your email and phone number first.", fixable: true };
      if (!history.firstOrder) return { code, ok: false, message: "This code is for first orders only." };
    }
    const elig = lines.filter((l) => !o.productIds?.length || o.productIds.includes(l.productId));
    const qty = elig.reduce((s, l) => s + l.quantity, 0);
    const amount = elig.reduce((s, l) => s + l.price * l.quantity, 0);
    if (qty === 0) return { code, ok: false, message: "This code doesn't apply to the items in your cart.", fixable: true };
    const needItems = Math.max(o.minItems || 0, o.level === "bxgy" ? (o.buyQty || 1) + (o.getProductIds?.length ? 0 : o.getQty || 1) : 0);
    if (qty < needItems) return { code, ok: false, message: `Add ${needItems - qty} more perfume${needItems - qty === 1 ? "" : "s"} to use this code.`, fixable: true };
    if (amount < (o.minSubtotal || 0)) return { code, ok: false, message: `Add ${inr((o.minSubtotal || 0) - amount)} more to use this code.`, fixable: true };
    if (o.level === "gift") return { code, ok: false, message: "The free gift for this code is out of stock right now." };
    return { code, ok: false, message: "This code can't be combined with the offers already in your cart." };
  });

  for (const code of entered.slice(MAX_CODES)) codeResults.push({ code, ok: false, message: `You can use up to ${MAX_CODES} codes on one order.` });

  const tax = Number((cart.total - cart.total / (1 + GST_RATE / 100)).toFixed(2));
  return {
    items: [...priced, ...gifts],
    subtotal: cart.subtotal,
    cartDiscount: cart.discount,
    total: cart.total,
    tax,
    appliedOffers,
    gifts,
    freeShipping: cart.freeShipping,
    codes: codeResults,
  };
}
