// "How close is the shopper to each offer" for the cart's progress bar. Pure, browser-safe.
// Kept apart from engine.ts so the engine stays an exact copy of the admin's.
import { isLive, priceCart, type CartLine, type Offer } from "./engine";

export type OfferStep = {
  offer: Offer;
  unlocked: boolean;
  progress: number; // 0..1
  itemsNeeded: number; // bottles still to add (0 when it's a ₹ condition or unlocked)
  amountNeeded: number; // ₹ still to add (0 when it's a bottle condition or unlocked)
  reward: string; // "1 bottle FREE", "free delivery", "10% off", ...
  target: string; // what the bar fills up to: "₹999" or "3 bottles"
};

const inr = (n: number) => "₹" + Math.ceil(n).toLocaleString("en-IN");

export function rewardText(o: Offer): string {
  if (o.level === "bxgy") {
    const n = o.getQty || 1;
    return o.getKind === "percent" ? `${n} perfume${n === 1 ? "" : "s"} at ${o.getValue || 0}% off` : `${n} perfume${n === 1 ? "" : "s"} FREE`;
  }
  if (o.level === "gift") return "a FREE gift";
  if (o.level === "shipping") return "FREE delivery";
  if (o.kind === "percent") return `${o.value}% off${o.maxDiscount ? ` (up to ${inr(o.maxDiscount)})` : ""}`;
  if (o.kind === "per_item") return `₹${o.value} off every perfume`;
  return `${inr(o.value)} off`;
}

/**
 * Automatic offers for everyone (no codes, not first-order only), in admin order, with how
 * far this cart is from each. Unlocked = the engine applies it to this cart right now.
 */
export function offerSteps(lines: CartLine[], offers: Offer[], now: Date = new Date()): OfferStep[] {
  const totals = priceCart(lines, offers, now);
  const active = new Set([...totals.applied.map((a) => a.id), ...totals.gifts.map((g) => g.offerId), ...(totals.freeShipping ? [totals.freeShipping.offerId] : [])]);
  return offers
    .filter((o) => o.level !== "product" && !o.couponCode && (o.eligibility || "everyone") === "everyone" && isLive(o, now))
    .sort((a, b) => a.sequence - b.sequence)
    .map((o) => {
      const elig = lines.filter((l) => !o.productIds?.length || o.productIds.includes(String(l.productId)));
      const qty = elig.reduce((s, l) => s + l.quantity, 0);
      const amount = elig.reduce((s, l) => s + l.price * l.quantity, 0);
      // Buy X get Y needs the bought bottles plus the free ones in the bag.
      const sameList = !o.getProductIds?.length;
      const needItems = Math.max(o.minItems || 0, o.level === "bxgy" ? (o.buyQty || 1) + (sameList ? o.getQty || 1 : 0) : 0, 1);
      const needAmount = o.minSubtotal || 0;
      const unlocked = active.has(o.id);
      const itemsNeeded = unlocked ? 0 : Math.max(0, needItems - qty);
      const amountNeeded = unlocked || itemsNeeded > 0 ? 0 : Math.max(0, needAmount - amount);
      const parts = [Math.min(1, qty / needItems), needAmount > 0 ? Math.min(1, amount / needAmount) : 1];
      // The bar tracks whichever condition is further away.
      const byAmount = needAmount > 0 && parts[1] < parts[0];
      const target = byAmount ? inr(needAmount) : `${needItems} perfume${needItems === 1 ? "" : "s"}`;
      return { offer: o, unlocked, progress: unlocked ? 1 : Math.min(...parts), itemsNeeded, amountNeeded, reward: rewardText(o), target };
    });
}

/**
 * The sentence for a row, split so the reward can be bold:
 * { lead: "Add ₹120 more to get", reward: "FREE delivery" }.
 */
export function stepText(s: OfferStep): { lead: string; reward: string } {
  if (s.unlocked) return { lead: "You've unlocked", reward: s.reward };
  if (s.itemsNeeded > 0) return { lead: `Add ${s.itemsNeeded} more perfume${s.itemsNeeded === 1 ? "" : "s"} to get`, reward: s.reward };
  if (s.amountNeeded > 0) return { lead: `Add ${inr(s.amountNeeded)} more to get`, reward: s.reward };
  // Conditions met but not applied: the free bottle must be a particular product, or an
  // offer that doesn't combine is applied instead.
  if (s.offer.level === "bxgy" && s.offer.getProductIds?.length) return { lead: "Add the offer perfume to get", reward: s.reward };
  return { lead: "Doesn't combine with your current offer:", reward: s.reward };
}
